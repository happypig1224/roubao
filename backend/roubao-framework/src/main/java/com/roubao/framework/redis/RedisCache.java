package com.roubao.framework.redis;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.BoundSetOperations;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * Spring Redis 统一分布式缓存工具类
 * 基于开源若依 (RuoYi) 核心 API 规范设计，并针对生产高可用与“缓存挂了业务也不能挂”底线完成企业级增强：
 * 1. 100% 还原若依原版全部常用结构方法 (String/Object, List, Set, Hash, Key 模糊匹配等)
 * 2. 全链路操作 Fail-Safe 容灾降级保护：Redis 宕机/超时/拒绝时只打印 WARN 告警，绝不抛出异常打崩业务
 * 3. 增强防雪崩写入 API (带随机 Jitter 抖动) 与标准 Cache-Aside 优雅回源读取 API
 * 4. 优化生产 keys 匹配，提供基于游标迭代的非阻塞扫描
 *
 * @author roubao (参考 RuoYi RedisCache 优化)
 * @since 2026-11-15
 */
@Slf4j
@SuppressWarnings(value = {"unchecked", "rawtypes"})
@Component
public class RedisCache {

    @Autowired
    public RedisTemplate redisTemplate;

    public RedisCache() {
    }

    public RedisCache(RedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 获取原生 RedisTemplate 实例
     *
     * @return RedisTemplate
     */
    public RedisTemplate getRedisTemplate() {
        return redisTemplate;
    }

    // ==========================================
    // 1. 普通对象 (String / ValueOperations) 缓存
    // ==========================================

    /**
     * 缓存基本的对象，Integer、String、实体类等
     *
     * @param key   缓存的键值
     * @param value 缓存的值
     */
    public <T> void setCacheObject(final String key, final T value) {
        try {
            redisTemplate.opsForValue().set(key, value);
        } catch (Exception e) {
            log.warn("Redis setCacheObject 操作异常降级 [key={}]: {}", key, e.getMessage());
        }
    }

    /**
     * 缓存基本的对象，Integer、String、实体类等（带超时时间，Integer 重载兼容若依）
     *
     * @param key      缓存的键值
     * @param value    缓存的值
     * @param timeout  超时时间
     * @param timeUnit 时间颗粒度
     */
    public <T> void setCacheObject(final String key, final T value, final Integer timeout, final TimeUnit timeUnit) {
        setCacheObject(key, value, timeout != null ? timeout.longValue() : 0L, timeUnit);
    }

    /**
     * 缓存基本的对象，带 Long 精度超时时间
     *
     * @param key      缓存的键值
     * @param value    缓存的值
     * @param timeout  超时时间
     * @param timeUnit 时间颗粒度
     */
    public <T> void setCacheObject(final String key, final T value, final Long timeout, final TimeUnit timeUnit) {
        try {
            if (timeout != null && timeout > 0 && timeUnit != null) {
                redisTemplate.opsForValue().set(key, value, timeout, timeUnit);
            } else {
                redisTemplate.opsForValue().set(key, value);
            }
        } catch (Exception e) {
            log.warn("Redis setCacheObject (带TTL) 操作异常降级 [key={}, timeout={}]: {}", key, timeout, e.getMessage());
        }
    }

    /**
     * 【生产防雪崩增强】缓存对象并自动注入 10%~20% 动态随机扰动 (Jitter)
     * 避免大批量 Key 在同一秒集体失效引发缓存雪崩打爆数据库
     *
     * @param key         缓存的键值
     * @param value       缓存的值
     * @param baseTimeout 基础有效时间
     * @param timeUnit    时间单位
     */
    public <T> void setCacheObjectWithJitter(final String key, final T value, final long baseTimeout, final TimeUnit timeUnit) {
        try {
            if (baseTimeout <= 0 || timeUnit == null) {
                setCacheObject(key, value);
                return;
            }
            long baseSeconds = timeUnit.toSeconds(baseTimeout);
            // 基础时间 + 10% 范围内的随机秒数
            long jitterSeconds = baseSeconds > 10 ? ThreadLocalRandom.current().nextLong(Math.max(1, baseSeconds / 10)) : 0L;
            redisTemplate.opsForValue().set(key, value, baseSeconds + jitterSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Redis setCacheObjectWithJitter 异常降级 [key={}]: {}", key, e.getMessage());
        }
    }

    /**
     * 获得缓存的基本对象
     * 若 Redis 宕机或网络异常，安全返回 null 触发业务优雅回源 DB
     *
     * @param key 缓存键值
     * @return 缓存键值对应的数据
     */
    public <T> T getCacheObject(final String key) {
        try {
            ValueOperations<String, T> operation = redisTemplate.opsForValue();
            return operation.get(key);
        } catch (Exception e) {
            log.warn("Redis getCacheObject 异常降级 [key={}], 自动回源数据库: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 【标准 Cache-Aside 架构增强】安全读取缓存，未命中或异常时自动执行回源逻辑并平滑回填
     *
     * @param key         缓存 Key
     * @param timeout     缓存时间
     * @param timeUnit    时间单位
     * @param dbFallback  回源数据库查询函数
     * @return 最终业务数据（优先缓存，兜底数据库）
     */
    public <T> T getCacheObject(final String key, final long timeout, final TimeUnit timeUnit, final Supplier<T> dbFallback) {
        T cachedValue = getCacheObject(key);
        if (cachedValue != null) {
            return cachedValue;
        }
        if (dbFallback == null) {
            return null;
        }
        // 回源数据库查询
        T dbValue = dbFallback.get();
        if (dbValue != null) {
            setCacheObjectWithJitter(key, dbValue, timeout, timeUnit);
        }
        return dbValue;
    }

    // ==========================================
    // 2. 键与生命周期 (Key & Expire) 操作
    // ==========================================

    /**
     * 设置有效时间（默认秒为单位）
     *
     * @param key     Redis 键
     * @param timeout 超时时间
     * @return true=设置成功；false=设置失败
     */
    public boolean expire(final String key, final long timeout) {
        return expire(key, timeout, TimeUnit.SECONDS);
    }

    /**
     * 设置有效时间
     *
     * @param key     Redis 键
     * @param timeout 超时时间
     * @param unit    时间单位
     * @return true=设置成功；false=设置失败
     */
    public boolean expire(final String key, final long timeout, final TimeUnit unit) {
        try {
            return Boolean.TRUE.equals(redisTemplate.expire(key, timeout, unit));
        } catch (Exception e) {
            log.warn("Redis expire 异常降级 [key={}]: {}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 获取有效时间（剩余生存时间 TTL）
     *
     * @param key Redis 键
     * @return 有效时间（-1: 永久有效；-2: key 不存在或已过期）
     */
    public long getExpire(final String key) {
        try {
            Long expire = redisTemplate.getExpire(key);
            return expire != null ? expire : -2L;
        } catch (Exception e) {
            log.warn("Redis getExpire 异常降级 [key={}]: {}", key, e.getMessage());
            return -2L;
        }
    }

    /**
     * 判断 key 是否存在
     *
     * @param key 键
     * @return true=存在；false=不存在
     */
    public Boolean hasKey(final String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.warn("Redis hasKey 异常降级 [key={}]: {}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 删除单个对象
     *
     * @param key 缓存键值
     * @return true=删除成功；false=删除失败
     */
    public boolean deleteObject(final String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.delete(key));
        } catch (Exception e) {
            log.warn("Redis deleteObject 异常降级 [key={}]: {}", key, e.getMessage());
            return false;
        }
    }

    /**
     * 删除集合对象
     *
     * @param collection 多个缓存键集合
     * @return 实际删除成功的条数
     */
    public long deleteObject(final Collection collection) {
        try {
            if (collection == null || collection.isEmpty()) {
                return 0L;
            }
            Long count = redisTemplate.delete(collection);
            return count != null ? count : 0L;
        } catch (Exception e) {
            log.warn("Redis 批量 deleteObject 异常降级: {}", e.getMessage());
            return 0L;
        }
    }

    // ==========================================
    // 3. 列表 (List) 结构操作
    // ==========================================

    /**
     * 缓存 List 数据
     *
     * @param key      缓存的键值
     * @param dataList 待缓存的 List 数据
     * @return 缓存的对象数量
     */
    public <T> long setCacheList(final String key, final List<T> dataList) {
        try {
            if (dataList == null || dataList.isEmpty()) {
                return 0L;
            }
            Long count = redisTemplate.opsForList().rightPushAll(key, dataList);
            return count != null ? count : 0L;
        } catch (Exception e) {
            log.warn("Redis setCacheList 异常降级 [key={}]: {}", key, e.getMessage());
            return 0L;
        }
    }

    /**
     * 获得缓存的 list 对象
     *
     * @param key 缓存的键值
     * @return 缓存键值对应的数据
     */
    public <T> List<T> getCacheList(final String key) {
        try {
            List<T> range = redisTemplate.opsForList().range(key, 0, -1);
            return range != null ? range : Collections.emptyList();
        } catch (Exception e) {
            log.warn("Redis getCacheList 异常降级 [key={}]: {}", key, e.getMessage());
            return Collections.emptyList();
        }
    }

    // ==========================================
    // 4. 集合 (Set) 结构操作
    // ==========================================

    /**
     * 缓存 Set
     *
     * @param key     缓存键值
     * @param dataSet 缓存的数据集合
     * @return 缓存数据的操作对象
     */
    public <T> BoundSetOperations<String, T> setCacheSet(final String key, final Set<T> dataSet) {
        try {
            BoundSetOperations<String, T> setOperation = redisTemplate.boundSetOps(key);
            if (dataSet != null && !dataSet.isEmpty()) {
                Iterator<T> it = dataSet.iterator();
                while (it.hasNext()) {
                    setOperation.add(it.next());
                }
            }
            return setOperation;
        } catch (Exception e) {
            log.warn("Redis setCacheSet 异常降级 [key={}]: {}", key, e.getMessage());
            return null;
        }
    }

    /**
     * 获得缓存的 set
     *
     * @param key 缓存键值
     * @return 缓存数据集合
     */
    public <T> Set<T> getCacheSet(final String key) {
        try {
            Set<T> members = redisTemplate.opsForSet().members(key);
            return members != null ? members : Collections.emptySet();
        } catch (Exception e) {
            log.warn("Redis getCacheSet 异常降级 [key={}]: {}", key, e.getMessage());
            return Collections.emptySet();
        }
    }

    // ==========================================
    // 5. 哈希 (Hash) 结构操作
    // ==========================================

    /**
     * 缓存 Map
     *
     * @param key     缓存键值
     * @param dataMap 待缓存的 Map
     */
    public <T> void setCacheMap(final String key, final Map<String, T> dataMap) {
        try {
            if (dataMap != null && !dataMap.isEmpty()) {
                redisTemplate.opsForHash().putAll(key, dataMap);
            }
        } catch (Exception e) {
            log.warn("Redis setCacheMap 异常降级 [key={}]: {}", key, e.getMessage());
        }
    }

    /**
     * 获得缓存的 Map
     *
     * @param key 缓存键值
     * @return 缓存的整个 Map
     */
    public <T> Map<String, T> getCacheMap(final String key) {
        try {
            Map<String, T> entries = redisTemplate.opsForHash().entries(key);
            return entries != null ? entries : Collections.emptyMap();
        } catch (Exception e) {
            log.warn("Redis getCacheMap 异常降级 [key={}]: {}", key, e.getMessage());
            return Collections.emptyMap();
        }
    }

    /**
     * 往 Hash 中存入单项数据
     *
     * @param key   Redis 键
     * @param hKey  Hash 键（Field）
     * @param value 值
     */
    public <T> void setCacheMapValue(final String key, final String hKey, final T value) {
        try {
            redisTemplate.opsForHash().put(key, hKey, value);
        } catch (Exception e) {
            log.warn("Redis setCacheMapValue 异常降级 [key={}, hKey={}]: {}", key, hKey, e.getMessage());
        }
    }

    /**
     * 获取 Hash 中的单项数据
     *
     * @param key  Redis 键
     * @param hKey Hash 键（Field）
     * @return Hash 中的对象
     */
    public <T> T getCacheMapValue(final String key, final String hKey) {
        try {
            HashOperations<String, String, T> opsForHash = redisTemplate.opsForHash();
            return opsForHash.get(key, hKey);
        } catch (Exception e) {
            log.warn("Redis getCacheMapValue 异常降级 [key={}, hKey={}]: {}", key, hKey, e.getMessage());
            return null;
        }
    }

    /**
     * 获取多个 Hash 中的数据
     *
     * @param key   Redis 键
     * @param hKeys Hash 键集合
     * @return Hash 对象集合
     */
    public List<Object> getMultiCacheMapValue(final String key, final Collection<Object> hKeys) {
        try {
            if (hKeys == null || hKeys.isEmpty()) {
                return Collections.emptyList();
            }
            List<Object> list = redisTemplate.opsForHash().multiGet(key, hKeys);
            return list != null ? list : Collections.emptyList();
        } catch (Exception e) {
            log.warn("Redis getMultiCacheMapValue 异常降级 [key={}]: {}", key, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 删除 Hash 中的单项数据
     *
     * @param key  Redis 键
     * @param hKey Hash 键（Field）
     * @return 删除成功返回 true
     */
    public boolean delCacheMapValue(final String key, final String hKey) {
        try {
            Long deleted = redisTemplate.opsForHash().delete(key, hKey);
            return deleted != null && deleted > 0;
        } catch (Exception e) {
            log.warn("Redis delCacheMapValue 异常降级 [key={}, hKey={}]: {}", key, hKey, e.getMessage());
            return false;
        }
    }

    // ==========================================
    // 6. 模糊匹配与游标扫描 (Keys & Scan) 操作
    // ==========================================

    /**
     * 获得缓存的基本对象列表（若依经典兼容方法）
     *
     * @param pattern 字符串前缀/通配符（如 "token:*"）
     * @return 匹配的 Key 集合
     */
    public Collection<String> keys(final String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            return keys != null ? keys : Collections.emptySet();
        } catch (Exception e) {
            log.warn("Redis keys 匹配异常降级 [pattern={}]: {}", pattern, e.getMessage());
            return Collections.emptySet();
        }
    }

    /**
     * 【生产推荐】基于游标迭代的非阻塞扫描（替代 KEYS 命令，避免单线程阻塞）
     *
     * @param pattern 表达式前缀
     * @return 匹配的 Key 集合
     */
    public Set<String> scanKeys(final String pattern) {
        Set<String> matchedKeys = new HashSet<>();
        try {
            ScanOptions options = ScanOptions.scanOptions().match(pattern).count(1000).build();
            try (Cursor<String> cursor = redisTemplate.scan(options)) {
                while (cursor.hasNext()) {
                    matchedKeys.add(cursor.next());
                }
            }
        } catch (Exception e) {
            log.warn("Redis scanKeys 扫描异常降级 [pattern={}]: {}", pattern, e.getMessage());
        }
        return matchedKeys;
    }
}


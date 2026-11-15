package com.roubao.framework.redis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * Redis 静态工具门面 (Facade)
 * 底层由 Spring 容器托管的 RedisCache 单例 Bean 代理驱动，
 * 支持在任何地方直接以静态方法安全调用，无需在每个业务实现类中重复声明注入，同时完整保留 Fail-Safe 容灾降级。
 *
 * @author roubao
 * @since 2026-11-15
 */
@Component
public class RedisUtils {

    private static volatile RedisCache redisCache;

    @Autowired
    public void setRedisCache(RedisCache cache) {
        RedisUtils.redisCache = cache;
    }

    public static RedisCache getDelegate() {
        return redisCache;
    }

    public static <T> void setCacheObject(final String key, final T value) {
        if (redisCache != null) {
            redisCache.setCacheObject(key, value);
        }
    }

    public static <T> void setCacheObject(final String key, final T value, final Integer timeout, final TimeUnit timeUnit) {
        if (redisCache != null) {
            redisCache.setCacheObject(key, value, timeout, timeUnit);
        }
    }

    public static <T> void setCacheObject(final String key, final T value, final Long timeout, final TimeUnit timeUnit) {
        if (redisCache != null) {
            redisCache.setCacheObject(key, value, timeout, timeUnit);
        }
    }

    public static <T> void setCacheObjectWithJitter(final String key, final T value, final long baseTimeout, final TimeUnit timeUnit) {
        if (redisCache != null) {
            redisCache.setCacheObjectWithJitter(key, value, baseTimeout, timeUnit);
        }
    }

    public static <T> T getCacheObject(final String key) {
        return redisCache != null ? redisCache.getCacheObject(key) : null;
    }

    public static <T> T getCacheObject(final String key, final long timeout, final TimeUnit timeUnit, final Supplier<T> dbFallback) {
        if (redisCache != null) {
            return redisCache.getCacheObject(key, timeout, timeUnit, dbFallback);
        }
        return dbFallback != null ? dbFallback.get() : null;
    }

    public static boolean expire(final String key, final long timeout) {
        return redisCache != null && redisCache.expire(key, timeout);
    }

    public static boolean expire(final String key, final long timeout, final TimeUnit unit) {
        return redisCache != null && redisCache.expire(key, timeout, unit);
    }

    public static long getExpire(final String key) {
        return redisCache != null ? redisCache.getExpire(key) : -2L;
    }

    public static Boolean hasKey(final String key) {
        return redisCache != null && redisCache.hasKey(key);
    }

    public static boolean deleteObject(final String key) {
        return redisCache != null && redisCache.deleteObject(key);
    }

    public static long deleteObject(final Collection<?> collection) {
        return redisCache != null ? redisCache.deleteObject(collection) : 0L;
    }

    public static <T> long setCacheList(final String key, final List<T> dataList) {
        return redisCache != null ? redisCache.setCacheList(key, dataList) : 0L;
    }

    public static <T> List<T> getCacheList(final String key) {
        return redisCache != null ? redisCache.getCacheList(key) : Collections.emptyList();
    }

    public static <T> void setCacheMap(final String key, final Map<String, T> dataMap) {
        if (redisCache != null) {
            redisCache.setCacheMap(key, dataMap);
        }
    }

    public static <T> Map<String, T> getCacheMap(final String key) {
        return redisCache != null ? redisCache.getCacheMap(key) : Collections.emptyMap();
    }

    public static Set<String> scanKeys(final String pattern) {
        return redisCache != null ? redisCache.scanKeys(pattern) : Collections.emptySet();
    }
}


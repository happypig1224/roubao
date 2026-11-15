package com.roubao.framework.redis;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.BoundSetOperations;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * RedisCache 工具类全维度单元测试
 * 覆盖：若依常规操作、Fail-Safe 容灾降级断言（即使 Redis 彻底抛出异常业务也不崩）、防雪崩 Jitter 与 Cache-Aside 兜底
 *
 * @author roubao
 * @since 2026-11-15
 */
@ExtendWith(MockitoExtension.class)
@SuppressWarnings("unchecked")
class RedisCacheTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @Mock
    private ListOperations<String, Object> listOperations;

    @Mock
    private SetOperations<String, Object> setOperations;

    @Mock
    private HashOperations<String, Object, Object> hashOperations;

    @Mock
    private BoundSetOperations<String, Object> boundSetOperations;

    private RedisCache redisCache;

    @BeforeEach
    void setUp() {
        redisCache = new RedisCache(redisTemplate);
    }

    @Test
    @DisplayName("正常读写对象与带 TTL 写入")
    void testBasicObjectOperations() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("test:key")).thenReturn("test:value");

        redisCache.setCacheObject("test:key", "test:value");
        verify(valueOperations).set("test:key", "test:value");

        redisCache.setCacheObject("test:key:ttl", "test:value", 60, TimeUnit.SECONDS);
        verify(valueOperations).set("test:key:ttl", "test:value", 60L, TimeUnit.SECONDS);

        String result = redisCache.getCacheObject("test:key");
        assertThat(result).isEqualTo("test:value");
    }

    @Test
    @DisplayName("核心原则断言：当 Redis 宕机或网络中断时，getCacheObject 必须 Fail-Safe 安全降级返回 null，绝不能向上抛出异常")
    void shouldGracefullyFallbackWhenRedisFailsOnGet() {
        when(redisTemplate.opsForValue()).thenThrow(new RedisConnectionFailureException("Redis server is down"));

        // 核心铁律：缓存挂了，业务绝不能挂
        assertThatCode(() -> {
            String value = redisCache.getCacheObject("article:slug:spring-boot");
            assertThat(value).isNull();
        }).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("核心原则断言：当 Redis 宕机时，setCacheObject 必须 Fail-Safe 吞下异常记录日志，不阻断主流程")
    void shouldGracefullyFallbackWhenRedisFailsOnSet() {
        when(redisTemplate.opsForValue()).thenThrow(new RedisConnectionFailureException("Redis connection refused"));

        assertThatCode(() -> {
            redisCache.setCacheObject("key", "val");
            redisCache.setCacheObject("key", "val", 10, TimeUnit.MINUTES);
            redisCache.setCacheObjectWithJitter("key", "val", 60, TimeUnit.SECONDS);
        }).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("标准 Cache-Aside 增强：缓存命中时直接返回，不走 DB 兜底")
    void testCacheAsideHit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("cache:hit")).thenReturn("cached-article");

        AtomicBoolean dbQueried = new AtomicBoolean(false);
        String result = redisCache.getCacheObject("cache:hit", 60, TimeUnit.SECONDS, () -> {
            dbQueried.set(true);
            return "db-article";
        });

        assertThat(result).isEqualTo("cached-article");
        assertThat(dbQueried.get()).isFalse(); // 未回源 DB
    }

    @Test
    @DisplayName("标准 Cache-Aside 增强：缓存未命中或 Redis 宕机时，平滑执行 DB 兜底并回填缓存")
    void testCacheAsideMissAndFallback() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("cache:miss")).thenReturn(null);

        AtomicBoolean dbQueried = new AtomicBoolean(false);
        String result = redisCache.getCacheObject("cache:miss", 60, TimeUnit.SECONDS, () -> {
            dbQueried.set(true);
            return "db-article";
        });

        assertThat(result).isEqualTo("db-article");
        assertThat(dbQueried.get()).isTrue(); // 成功回源 DB
        verify(valueOperations).set(eq("cache:miss"), eq("db-article"), anyLong(), eq(TimeUnit.SECONDS));
    }

    @Test
    @DisplayName("TTL、过期检查与键删除")
    void testKeyAndExpireOperations() {
        when(redisTemplate.expire("key:1", 30L, TimeUnit.SECONDS)).thenReturn(true);
        when(redisTemplate.getExpire("key:1")).thenReturn(30L);
        when(redisTemplate.hasKey("key:1")).thenReturn(true);
        when(redisTemplate.delete("key:1")).thenReturn(true);
        when(redisTemplate.delete(any(List.class))).thenReturn(2L);

        assertThat(redisCache.expire("key:1", 30L)).isTrue();
        assertThat(redisCache.getExpire("key:1")).isEqualTo(30L);
        assertThat(redisCache.hasKey("key:1")).isTrue();
        assertThat(redisCache.deleteObject("key:1")).isTrue();
        assertThat(redisCache.deleteObject(Arrays.asList("key:1", "key:2"))).isEqualTo(2L);
    }

    @Test
    @DisplayName("List 列表操作正常存取与异常兜底")
    void testListOperations() {
        when(redisTemplate.opsForList()).thenReturn(listOperations);
        when(listOperations.rightPushAll("list:key", Arrays.asList("a", "b"))).thenReturn(2L);
        when(listOperations.range("list:key", 0, -1)).thenReturn(Arrays.asList("a", "b"));

        long count = redisCache.setCacheList("list:key", Arrays.asList("a", "b"));
        assertThat(count).isEqualTo(2L);

        List<String> list = redisCache.getCacheList("list:key");
        assertThat(list).containsExactly("a", "b");
    }

    @Test
    @DisplayName("Set 集合操作正常存取与异常兜底")
    void testSetOperations() {
        when(redisTemplate.boundSetOps("set:key")).thenReturn(boundSetOperations);
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(setOperations.members("set:key")).thenReturn(new HashSet<>(Arrays.asList("x", "y")));

        BoundSetOperations<String, Object> boundOps = redisCache.setCacheSet("set:key", new HashSet<>(Arrays.asList("x", "y")));
        assertThat(boundOps).isNotNull();

        Set<String> set = redisCache.getCacheSet("set:key");
        assertThat(set).containsExactlyInAnyOrder("x", "y");
    }

    @Test
    @DisplayName("Hash 散列操作存取、单项写入与批量删除")
    void testHashOperations() {
        when(redisTemplate.opsForHash()).thenReturn((HashOperations) hashOperations);
        Map<String, String> testMap = new HashMap<>();
        testMap.put("f1", "v1");
        when(hashOperations.entries("hash:key")).thenReturn((Map) testMap);
        when(hashOperations.get("hash:key", "f1")).thenReturn("v1");
        when(hashOperations.delete("hash:key", "f1")).thenReturn(1L);

        redisCache.setCacheMap("hash:key", testMap);
        verify(hashOperations).putAll("hash:key", testMap);

        Map<String, String> map = redisCache.getCacheMap("hash:key");
        assertThat(map).containsEntry("f1", "v1");

        redisCache.setCacheMapValue("hash:key", "f1", "v1");
        verify(hashOperations).put("hash:key", "f1", "v1");

        String val = redisCache.getCacheMapValue("hash:key", "f1");
        assertThat(val).isEqualTo("v1");

        boolean deleted = redisCache.delCacheMapValue("hash:key", "f1");
        assertThat(deleted).isTrue();
    }

    @Test
    @DisplayName("模糊 Keys 匹配")
    void testKeysMatching() {
        when(redisTemplate.keys("prefix:*")).thenReturn(new HashSet<>(Arrays.asList("prefix:1", "prefix:2")));

        var keys = redisCache.keys("prefix:*");
        assertThat(keys).containsExactlyInAnyOrder("prefix:1", "prefix:2");
    }
}


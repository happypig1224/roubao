package com.roubao.framework.redis;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RedisSerializerTest {

    record TestItem(Long id, String name, LocalDateTime time) {}

    @Test
    void testSerialization() {
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer()
                .configure(mapper -> {
                    mapper.registerModule(new JavaTimeModule());
                    mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
                });

        TestItem item = new TestItem(1L, "test", LocalDateTime.now());
        byte[] bytes = serializer.serialize(item);
        Object deserialized = serializer.deserialize(bytes);
        assertThat(deserialized).isInstanceOf(TestItem.class);

        List<TestItem> list = new ArrayList<>();
        list.add(item);
        byte[] listBytes = serializer.serialize(list);
        Object deserializedList = serializer.deserialize(listBytes);
        assertThat(deserializedList).isInstanceOf(List.class);
    }
}

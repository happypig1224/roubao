package com.roubao.framework.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 分页契约前后端对齐与计算字段测试
 *
 * @author roubao
 * @since 2026-11-14
 */
class PageResultContractTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("PageResult 序列化必须包含 pageNo、pageSize 与精准计算的 totalPages")
    void shouldSerializeAlignedPageFields() throws Exception {
        List<String> list = List.of("art-1", "art-2", "art-3");
        PageResult<String> pageResult = PageResult.of(list, 25, 2, 10);

        assertThat(pageResult.getPageNo()).isEqualTo(2);
        assertThat(pageResult.getPageSize()).isEqualTo(10);
        assertThat(pageResult.getTotalPages()).isEqualTo(3);

        String json = objectMapper.writeValueAsString(pageResult);
        JsonNode node = objectMapper.readTree(json);

        assertThat(node.get("pageNo").asLong()).isEqualTo(2);
        assertThat(node.get("pageSize").asLong()).isEqualTo(10);
        assertThat(node.get("totalPages").asLong()).isEqualTo(3);
        assertThat(node.get("total").asLong()).isEqualTo(25);
    }
}

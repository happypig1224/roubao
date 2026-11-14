package com.roubao.app.controller.portal;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 分类前台门户 REST 接口验收测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest
@AutoConfigureMockMvc
class CategoryPortalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("拉取分类列表：返回 200 且包含预置种子数据")
    void shouldReturnCategoryListSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(4))))
                .andExpect(jsonPath("$.data[0].categorySlug").isNotEmpty())
                .andExpect(jsonPath("$.data[0].categoryName").isNotEmpty());
    }
}


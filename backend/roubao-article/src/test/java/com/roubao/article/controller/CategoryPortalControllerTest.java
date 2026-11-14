package com.roubao.article.controller;

import com.roubao.article.TestArticleApplication;
import com.roubao.article.entity.CategoryDO;
import com.roubao.article.mapper.CategoryMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 分类前台门户 REST 接口验收测试 (roubao-article 领域自治)
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest(classes = TestArticleApplication.class)
@AutoConfigureMockMvc
@Transactional
class CategoryPortalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryMapper categoryMapper;

    @BeforeEach
    void setUp() {
        if (categoryMapper.selectCount(null) < 4) {
            String[][] seedCategories = {
                    {"后端架构", "backend", "Server", "100"},
                    {"前端工程", "frontend", "Layout", "90"},
                    {"系统架构", "architecture", "Boxes", "80"},
                    {"性能调优", "performance", "Cpu", "70"}
            };
            for (String[] seed : seedCategories) {
                CategoryDO c = new CategoryDO();
                c.setCategoryName(seed[0]);
                c.setCategorySlug(seed[1]);
                c.setIconName(seed[2]);
                c.setSortOrder(Integer.parseInt(seed[3]));
                categoryMapper.insert(c);
            }
        }
    }

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

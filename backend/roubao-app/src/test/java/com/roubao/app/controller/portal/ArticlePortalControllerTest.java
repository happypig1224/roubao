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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 文章前台门户 REST 接口验收测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest
@AutoConfigureMockMvc
class ArticlePortalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("分页查询文章列表：返回 200 且数据符合 PageResult 契约")
    void shouldReturnArticlePageSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/articles")
                        .param("pageNo", "1")
                        .param("pageSize", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray())
                .andExpect(jsonPath("$.data.total").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.list[0].slug").isNotEmpty())
                .andExpect(jsonPath("$.data.list[0].title").isNotEmpty())
                .andExpect(jsonPath("$.data.list[0].contentMarkdown").doesNotExist());
    }

    @Test
    @DisplayName("根据 Slug 查询详情：返回 200 且包含正文 Markdown 与聚合指标")
    void shouldReturnArticleDetailBySlug() throws Exception {
        mockMvc.perform(get("/api/v1/articles/java-21-virtual-threads-benchmark-pitfalls")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.slug").value("java-21-virtual-threads-benchmark-pitfalls"))
                .andExpect(jsonPath("$.data.title").isNotEmpty())
                .andExpect(jsonPath("$.data.contentMarkdown").isNotEmpty())
                .andExpect(jsonPath("$.data.categoryName").isNotEmpty());
    }

    @Test
    @DisplayName("Slug 不存在时：返回明确的 ARTICLE_NOT_FOUND 业务错误码")
    void shouldReturnNotFoundWhenSlugDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/v1/articles/non-existing-slug-xyz")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1001))
                .andExpect(jsonPath("$.message").value(containsString("不存在")));
    }

    @Test
    @DisplayName("文章阅读量打点：POST 阅读量自增返回 200 成功")
    void shouldIncrementArticleViewsSuccessfully() throws Exception {
        mockMvc.perform(post("/api/v1/articles/java-21-virtual-threads-benchmark-pitfalls/views")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}


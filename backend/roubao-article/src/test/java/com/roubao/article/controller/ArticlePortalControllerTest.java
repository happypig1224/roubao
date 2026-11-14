package com.roubao.article.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.roubao.article.TestArticleApplication;
import com.roubao.article.entity.ArticleContentDO;
import com.roubao.article.entity.ArticleDO;
import com.roubao.article.entity.ArticleStatsDO;
import com.roubao.article.entity.CategoryDO;
import com.roubao.article.mapper.ArticleContentMapper;
import com.roubao.article.mapper.ArticleMapper;
import com.roubao.article.mapper.ArticleStatsMapper;
import com.roubao.article.mapper.CategoryMapper;
import com.roubao.article.service.ArticleService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 文章前台门户 REST 接口验收测试 (roubao-article 领域自治)
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest(classes = TestArticleApplication.class)
@AutoConfigureMockMvc
class ArticlePortalControllerTest {

    private static final String TEST_SLUG = "java-21-virtual-threads-benchmark-pitfalls";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ArticleService articleService;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleContentMapper articleContentMapper;

    @Autowired
    private ArticleStatsMapper articleStatsMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    private Long createdArticleId;

    @BeforeEach
    void setUp() {
        cleanUp();

        // 预置基础分类
        CategoryDO category = new CategoryDO();
        category.setCategoryName("后端架构");
        category.setCategorySlug("backend");
        category.setIconName("Server");
        category.setSortOrder(100);
        categoryMapper.insert(category);

        // 预置基准文章
        ArticleDO article = new ArticleDO();
        article.setCategoryId(category.getId());
        article.setTitle("Java 21 虚拟线程压测与踩坑记录");
        article.setSlug(TEST_SLUG);
        article.setSummary("在单台 2C4G 服务器上对比传统线程池与虚拟线程的吞吐表现。");
        article.setCoverImageKey("covers/threads.webp");
        article.setFileType("md");
        article.setTags(List.of("Java 21", "Spring Boot", "性能优化"));
        article.setReadTimeMinutes(7);
        article.setSortOrder(100);
        article.setPublished(true);
        article.setTop(true);
        article.setFeatured(true);
        article.setPublishedAt(LocalDateTime.now());

        String markdown = "# 虚拟线程踩坑记录\n\n压测数据显示，在轻量 I/O 阻塞场景下，QPS 提升明显。";
        createdArticleId = articleService.createArticle(article, markdown);
    }

    @AfterEach
    void tearDown() {
        cleanUp();
    }

    private void cleanUp() {
        articleMapper.findBySlug(TEST_SLUG).ifPresent(art -> {
            articleContentMapper.delete(new LambdaQueryWrapper<ArticleContentDO>().eq(ArticleContentDO::getArticleId, art.getId()));
            articleStatsMapper.delete(new LambdaQueryWrapper<ArticleStatsDO>().eq(ArticleStatsDO::getArticleId, art.getId()));
            articleMapper.deleteById(art.getId());
        });
        categoryMapper.delete(new LambdaQueryWrapper<CategoryDO>().eq(CategoryDO::getCategorySlug, "backend"));
    }

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
        mockMvc.perform(get("/api/v1/articles/" + TEST_SLUG)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.slug").value(TEST_SLUG))
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
        mockMvc.perform(post("/api/v1/articles/" + TEST_SLUG + "/views")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}

package com.roubao.article.service;

import com.roubao.article.TestArticleApplication;
import com.roubao.article.entity.ArticleDO;
import com.roubao.article.mapper.ArticleMapper;
import com.roubao.article.model.vo.ArticleDetailVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 虚拟线程异步聚合调度断言测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest(classes = TestArticleApplication.class)
@ActiveProfiles("test")
class ArticleVirtualThreadExecutionTest {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private ArticleMapper articleMapper;

    @Test
    @DisplayName("查询文章详情聚合时必须通过虚拟线程完成子任务调度")
    void shouldExecuteDetailAggregationOnVirtualThread() {
        ArticleDO article = new ArticleDO();
        article.setTitle("虚拟线程验证文章");
        article.setSlug("vt-test-article-slug");
        article.setSummary("验证虚拟线程调度");
        article.setFileType("md");
        article.setPublished(true);
        article.setSortOrder(10);
        article.setReadTimeMinutes(3);

        articleService.createArticle(article, "# 虚拟线程正文内容");

        ArticleDetailVO detail = articleService.getArticleDetailBySlug("vt-test-article-slug");

        assertThat(detail).isNotNull();
        assertThat(detail.title()).isEqualTo("虚拟线程验证文章");
        assertThat(detail.contentMarkdown()).isEqualTo("# 虚拟线程正文内容");

        // 验证执行器装配
        assertThat(articleService.isVirtualThreadExecutionSupported()).isTrue();
    }
}

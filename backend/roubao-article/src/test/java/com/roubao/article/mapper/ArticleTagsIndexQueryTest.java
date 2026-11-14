package com.roubao.article.mapper;

import com.roubao.article.TestArticleApplication;
import com.roubao.article.entity.ArticleDO;
import com.roubao.article.model.dto.ArticleQueryDTO;
import com.roubao.article.model.vo.ArticleListVO;
import com.roubao.article.service.ArticleService;
import com.roubao.framework.common.PageResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 文章技术标签精准检索与索引支撑验证测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest(classes = TestArticleApplication.class)
@ActiveProfiles("test")
class ArticleTagsIndexQueryTest {

    @Autowired
    private ArticleService articleService;

    @Test
    @DisplayName("根据标签筛选文章时必须精准匹配包含目标标签的文章")
    void shouldQueryArticlesByExactTag() {
        ArticleDO a1 = new ArticleDO();
        a1.setTitle("Spring Boot 3 与标签索引实战");
        a1.setSlug("spring-boot-3-tags-test");
        a1.setSummary("实战标签索引");
        a1.setTags(List.of("Java 21", "Spring Boot 3", "Architecture"));
        a1.setFileType("md");
        a1.setPublished(true);
        a1.setSortOrder(10);
        articleService.createArticle(a1, "# 正文");

        ArticleQueryDTO query = new ArticleQueryDTO();
        query.setTag("Spring Boot 3");
        PageResult<ArticleListVO> result = articleService.pageArticles(query);

        assertThat(result.getList()).isNotEmpty();
        assertThat(result.getList().stream().anyMatch(a -> a.slug().equals("spring-boot-3-tags-test"))).isTrue();

        ArticleQueryDTO queryNonExistent = new ArticleQueryDTO();
        queryNonExistent.setTag("NonExistentTagXYZ");
        PageResult<ArticleListVO> emptyResult = articleService.pageArticles(queryNonExistent);
        assertThat(emptyResult.getList().stream().noneMatch(a -> a.slug().equals("spring-boot-3-tags-test"))).isTrue();
    }
}

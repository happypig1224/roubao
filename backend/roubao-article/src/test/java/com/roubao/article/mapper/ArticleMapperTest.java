package com.roubao.article.mapper;

import com.roubao.article.entity.ArticleContentDO;
import com.roubao.article.entity.ArticleDO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 文章元数据与长正文大字段持久层单元测试
 * 核心验证：JSON 数组 TypeHandler 往返、布尔字段映射、findBySlug 及长文本 1:1 分离
 *
 * @author roubao
 * @since 2026-11-13
 */
@SpringBootTest
@Transactional
class ArticleMapperTest {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleContentMapper articleContentMapper;

    @Test
    @DisplayName("应该成功映射文章实体并保持 JSON 标签与布尔属性往返一致")
    void shouldPersistArticleWithJsonTagsAndBooleanFields() {
        // Arrange
        ArticleDO article = new ArticleDO();
        article.setCategoryId(1L);
        article.setTitle("Java 21 虚拟线程压测与踩坑记录");
        article.setSlug("java-21-virtual-threads-benchmark");
        article.setSummary("单台 2C4G 虚拟机压测与载体线程固化排障分析");
        article.setCoverImageKey("covers/2026/11/threads.webp");
        article.setContentUrl("https://cdn.roubao.dev/posts/2026/threads.md");
        article.setFileType("md");
        article.setTags(List.of("Java 21", "Spring Boot", "性能优化"));
        article.setReadTimeMinutes(7);
        article.setSortOrder(100);
        article.setPublished(true);
        article.setTop(false);
        article.setFeatured(true);
        article.setDeleted(false);
        article.setPublishedAt(LocalDateTime.now());

        // Act - 插入文章元数据
        int rows = articleMapper.insert(article);
        assertThat(rows).isEqualTo(1);
        assertThat(article.getId()).isNotNull();

        // Assert - 根据 Slug 查询，验证字段显式映射与 JSON 数组反序列化
        Optional<ArticleDO> queriedOpt = articleMapper.findBySlug("java-21-virtual-threads-benchmark");
        assertThat(queriedOpt).isPresent();

        ArticleDO queried = queriedOpt.get();
        assertThat(queried.getTitle()).isEqualTo("Java 21 虚拟线程压测与踩坑记录");
        assertThat(queried.getCoverImageKey()).isEqualTo("covers/2026/11/threads.webp");
        assertThat(queried.getPublished()).isTrue();
        assertThat(queried.getTop()).isFalse();
        assertThat(queried.getFeatured()).isTrue();

        // 核心验证: JSON TypeHandler 正确将 JSON 字符串还原为 List<String>
        assertThat(queried.getTags())
                .isNotNull()
                .hasSize(3)
                .containsExactly("Java 21", "Spring Boot", "性能优化");

        // Act - 插入独立的长正文大字段
        ArticleContentDO content = new ArticleContentDO();
        content.setArticleId(article.getId());
        content.setContentMarkdown("# 正文标题\n\n这是一篇几万字节的超长 Markdown 内容测试...");

        int contentRows = articleContentMapper.insert(content);
        assertThat(contentRows).isEqualTo(1);

        // Assert - 验证大字段通过 article_id 独立读取
        Optional<ArticleContentDO> contentOpt = articleContentMapper.findByArticleId(article.getId());
        assertThat(contentOpt).isPresent();
        assertThat(contentOpt.get().getContentMarkdown()).contains("# 正文标题");
    }
}

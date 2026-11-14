package com.roubao.article.model.vo;

import com.roubao.article.entity.ArticleDO;
import com.roubao.article.entity.CategoryDO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 文章业务模型 VO 转换与防腐隔离单元测试
 *
 * @author roubao
 * @since 2026-11-14
 */
class ArticleVoMappingTest {

    @Test
    @DisplayName("ArticleListVO - 物理反射检查：严禁包含任何正文大文本字段，确保列表防腐")
    void shouldEnsureArticleListVoExcludesLargeTextContent() {
        Field[] declaredFields = ArticleListVO.class.getDeclaredFields();
        List<String> fieldNames = Arrays.stream(declaredFields)
                .map(Field::getName)
                .toList();

        assertThat(fieldNames)
                .doesNotContain("contentMarkdown", "content", "markdown")
                .doesNotContain("isDeleted", "deleted");
    }

    @Test
    @DisplayName("ArticleListVO - 静态转换防腐：防御性深拷贝，源数据变更不影响已生成的 VO")
    void shouldPerformDefensiveCopyAndDefaultingOnArticleListVo() {
        ArticleDO articleDO = new ArticleDO();
        articleDO.setId(1001L);
        articleDO.setCategoryId(2L);
        articleDO.setTitle("Java 21 虚拟线程");
        articleDO.setSlug("java-21-vt");
        articleDO.setSummary("摘要信息");
        articleDO.setCoverImageKey("covers/test.webp");
        List<String> mutableTags = new ArrayList<>(List.of("Java", "JVM"));
        articleDO.setTags(mutableTags);
        articleDO.setReadTimeMinutes(8);
        articleDO.setSortOrder(5);
        articleDO.setTop(true);
        articleDO.setFeatured(true);
        articleDO.setPublishedAt(LocalDateTime.now());
        articleDO.setGmtCreate(LocalDateTime.now());

        ArticleListVO vo = ArticleListVO.from(articleDO, "后端技术", null, null);

        assertThat(vo).isNotNull();
        assertThat(vo.id()).isEqualTo(1001L);
        assertThat(vo.categoryName()).isEqualTo("后端技术");
        assertThat(vo.viewCount()).isEqualTo(0L); // 统计指标非空保底
        assertThat(vo.likeCount()).isEqualTo(0L);
        assertThat(vo.tags()).containsExactly("Java", "JVM");

        // 验证防腐：修改源 List，VO 内部集合不受影响
        mutableTags.add("PollutedTag");
        assertThat(vo.tags()).doesNotContain("PollutedTag");

        // 验证不可变性：直接尝试修改 VO 的 tags 集合抛出 UnsupportedOperationException
        List<String> voTags = vo.tags();
        assertThatThrownBy(() -> voTags.add("Illegal"))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("ArticleDetailVO - 正文详情组装与数据隔离验证")
    void shouldAssembleArticleDetailVoWithContentAndDefensiveCopy() {
        ArticleDO articleDO = new ArticleDO();
        articleDO.setId(2001L);
        articleDO.setCategoryId(3L);
        articleDO.setTitle("架构设计原则");
        articleDO.setSlug("arch-design");
        articleDO.setSummary("高可用系统设计");
        articleDO.setFileType("md");
        articleDO.setTags(List.of("Architecture", "SystemDesign"));
        articleDO.setReadTimeMinutes(12);
        articleDO.setSortOrder(20);
        articleDO.setPublished(true);
        articleDO.setTop(false);
        articleDO.setFeatured(true);
        articleDO.setPublishedAt(LocalDateTime.now());
        articleDO.setGmtCreate(LocalDateTime.now());
        articleDO.setGmtModified(LocalDateTime.now());

        String markdownContent = "# 架构正文\n\n详述系统架构...";

        ArticleDetailVO detailVO = ArticleDetailVO.from(articleDO, markdownContent, "系统架构", 888L, 66L);

        assertThat(detailVO).isNotNull();
        assertThat(detailVO.id()).isEqualTo(2001L);
        assertThat(detailVO.contentMarkdown()).isEqualTo(markdownContent);
        assertThat(detailVO.categoryName()).isEqualTo("系统架构");
        assertThat(detailVO.viewCount()).isEqualTo(888L);
        assertThat(detailVO.likeCount()).isEqualTo(66L);
        assertThat(detailVO.published()).isTrue();
    }

    @Test
    @DisplayName("CategoryVO - 分类视图对象正确映射与空实体安全处理")
    void shouldMapCategoryVoAccurately() {
        assertThat(CategoryVO.from(null)).isNull();

        CategoryDO categoryDO = new CategoryDO();
        categoryDO.setId(10L);
        categoryDO.setCategoryName("算法与数据结构");
        categoryDO.setCategorySlug("algorithms");
        categoryDO.setDescription("LeetCode 与工程数据结构");
        categoryDO.setIconName("code");
        categoryDO.setSortOrder(99);

        CategoryVO vo = CategoryVO.from(categoryDO);

        assertThat(vo).isNotNull();
        assertThat(vo.id()).isEqualTo(10L);
        assertThat(vo.categoryName()).isEqualTo("算法与数据结构");
        assertThat(vo.categorySlug()).isEqualTo("algorithms");
        assertThat(vo.description()).isEqualTo("LeetCode 与工程数据结构");
        assertThat(vo.iconName()).isEqualTo("code");
        assertThat(vo.sortOrder()).isEqualTo(99);
    }
}

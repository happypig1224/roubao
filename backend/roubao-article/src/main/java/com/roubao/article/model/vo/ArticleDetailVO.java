package com.roubao.article.model.vo;

import com.roubao.article.entity.ArticleDO;
import com.roubao.article.model.dto.ArticleStaticDTO;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * 文章正文详情视图对象
 * 聚合文章元数据、完整正文大字段与统计指标
 *
 * @author roubao
 * @since 2026-11-14
 */
public record ArticleDetailVO(
        Long id,
        Long categoryId,
        String categoryName,
        String categorySlug,
        String title,
        String slug,
        String summary,
        String coverImageKey,
        String contentMarkdown,
        String contentUrl,
        String fileType,
        List<String> tags,
        Integer readTimeMinutes,
        Integer sortOrder,
        Boolean published,
        Boolean top,
        Boolean featured,
        LocalDateTime publishedAt,
        Long viewCount,
        Long likeCount,
        LocalDateTime gmtCreate,
        LocalDateTime gmtModified
) implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 静态组装文章正文详情 (兼容旧版调用)
     */
    public static ArticleDetailVO from(ArticleDO article,
                                       String contentMarkdown,
                                       String categoryName,
                                       Long viewCount,
                                       Long likeCount) {
        return from(article, contentMarkdown, categoryName, "", viewCount, likeCount);
    }

    /**
     * 静态组装文章正文详情，执行数据防腐与非空保底
     *
     * @param article         文章元数据实体
     * @param contentMarkdown 正文大字段 Markdown 内容
     * @param categoryName    所属分类名称
     * @param categorySlug    所属分类英文标识
     * @param viewCount       阅读量
     * @param likeCount       点赞量
     * @return 文章详情视图对象
     */
    public static ArticleDetailVO from(ArticleDO article,
                                       String contentMarkdown,
                                       String categoryName,
                                       String categorySlug,
                                       Long viewCount,
                                       Long likeCount) {
        if (article == null) {
            return null;
        }
        return new ArticleDetailVO(
                article.getId(),
                article.getCategoryId(),
                categoryName != null ? categoryName : "",
                categorySlug != null ? categorySlug : "",
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getCoverImageKey(),
                contentMarkdown != null ? contentMarkdown : "",
                article.getContentUrl(),
                article.getFileType(),
                article.getTags() != null ? List.copyOf(article.getTags()) : Collections.emptyList(),
                article.getReadTimeMinutes(),
                article.getSortOrder(),
                Boolean.TRUE.equals(article.getPublished()),
                Boolean.TRUE.equals(article.getTop()),
                Boolean.TRUE.equals(article.getFeatured()),
                article.getPublishedAt(),
                viewCount != null ? Math.max(0L, viewCount) : 0L,
                likeCount != null ? Math.max(0L, likeCount) : 0L,
                article.getGmtCreate(),
                article.getGmtModified()
        );
    }

    /**
     * 从静态大对象与独立动态计数组装完整视图 (动静解耦)
     *
     * @param staticDto 静态大对象
     * @param viewCount 阅读量
     * @param likeCount 点赞量
     * @return 文章详情视图对象
     */
    public static ArticleDetailVO from(ArticleStaticDTO staticDto,
                                       Long viewCount,
                                       Long likeCount) {
        if (staticDto == null) {
            return null;
        }
        return new ArticleDetailVO(
                staticDto.id(),
                staticDto.categoryId(),
                staticDto.categoryName() != null ? staticDto.categoryName() : "",
                staticDto.categorySlug() != null ? staticDto.categorySlug() : "",
                staticDto.title(),
                staticDto.slug(),
                staticDto.summary(),
                staticDto.coverImageKey(),
                staticDto.contentMarkdown() != null ? staticDto.contentMarkdown() : "",
                staticDto.contentUrl(),
                staticDto.fileType(),
                staticDto.tags() != null ? List.copyOf(staticDto.tags()) : Collections.emptyList(),
                staticDto.readTimeMinutes(),
                staticDto.sortOrder(),
                Boolean.TRUE.equals(staticDto.published()),
                Boolean.TRUE.equals(staticDto.top()),
                Boolean.TRUE.equals(staticDto.featured()),
                staticDto.publishedAt(),
                viewCount != null ? Math.max(0L, viewCount) : 0L,
                likeCount != null ? Math.max(0L, likeCount) : 0L,
                staticDto.gmtCreate(),
                staticDto.gmtModified()
        );
    }
}

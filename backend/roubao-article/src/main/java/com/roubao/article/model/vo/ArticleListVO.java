package com.roubao.article.model.vo;

import com.roubao.article.entity.ArticleDO;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * 文章列表卡片视图对象
 * 严格剔除正文大文本大字段，保障列表传输效率与内存安全
 *
 * @author roubao
 * @since 2026-11-14
 */
public record ArticleListVO(
        Long id,
        Long categoryId,
        String categoryName,
        String title,
        String slug,
        String summary,
        String coverImageKey,
        List<String> tags,
        Integer readTimeMinutes,
        Integer sortOrder,
        Boolean top,
        Boolean featured,
        LocalDateTime publishedAt,
        Long viewCount,
        Long likeCount,
        LocalDateTime gmtCreate
) implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 静态组装文章列表项，执行深拷贝防腐与非空保底
     *
     * @param article      文章元数据实体
     * @param categoryName 所属分类展示名
     * @param viewCount    阅读量
     * @param likeCount    点赞量
     * @return 文章列表视图对象
     */
    public static ArticleListVO from(ArticleDO article, String categoryName, Long viewCount, Long likeCount) {
        if (article == null) {
            return null;
        }
        return new ArticleListVO(
                article.getId(),
                article.getCategoryId(),
                categoryName != null ? categoryName : "",
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getCoverImageKey(),
                article.getTags() != null ? List.copyOf(article.getTags()) : Collections.emptyList(),
                article.getReadTimeMinutes(),
                article.getSortOrder(),
                Boolean.TRUE.equals(article.getTop()),
                Boolean.TRUE.equals(article.getFeatured()),
                article.getPublishedAt(),
                viewCount != null ? Math.max(0L, viewCount) : 0L,
                likeCount != null ? Math.max(0L, likeCount) : 0L,
                article.getGmtCreate()
        );
    }
}

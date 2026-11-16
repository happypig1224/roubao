package com.roubao.article.model.dto;

import com.roubao.article.entity.ArticleDO;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * 文章静态大对象缓存数据传输模型 (动静彻底分离架构)
 * 剔除高频变动的阅读量 (viewCount) 与点赞量 (likeCount)，
 * 专注承载 Markdown 长篇正文与文章固定元数据，避免因动态打点导致大正文缓存频繁被冲刷失效。
 *
 * @author roubao
 * @since 2026-11-15
 */
public record ArticleStaticDTO(
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
        LocalDateTime gmtCreate,
        LocalDateTime gmtModified
) implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 空对象防穿透常量标记 (Null-Object)
     */
    public static final ArticleStaticDTO EMPTY = new ArticleStaticDTO(
            -1L, null, null, null, null, null, null, null, null, null, null,
            Collections.emptyList(), null, null, null, null, null, null, null, null
    );

    /**
     * 判断当前是否为空值防穿透标记
     *
     * @return true 代表是空值占位
     */
    public boolean isEmpty() {
        return this.id != null && this.id == -1L;
    }

    /**
     * 从文章实体与正文组装静态传输对象 (兼容模式)
     */
    public static ArticleStaticDTO from(ArticleDO article, String contentMarkdown, String categoryName) {
        return from(article, contentMarkdown, categoryName, "");
    }

    /**
     * 从文章实体与正文组装静态传输对象 (全契约对齐)
     *
     * @param article         文章元数据实体
     * @param contentMarkdown Markdown 完整长正文
     * @param categoryName    所属分类展示名
     * @param categorySlug    所属分类英文路由标识
     * @return 静态传输对象
     */
    public static ArticleStaticDTO from(ArticleDO article, String contentMarkdown, String categoryName, String categorySlug) {
        if (article == null) {
            return null;
        }
        return new ArticleStaticDTO(
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
                article.getTags() != null ? Collections.unmodifiableList(article.getTags()) : Collections.emptyList(),
                article.getReadTimeMinutes(),
                article.getSortOrder(),
                article.getPublished(),
                article.getTop(),
                article.getFeatured(),
                article.getPublishedAt(),
                article.getGmtCreate(),
                article.getGmtModified()
        );
    }
}

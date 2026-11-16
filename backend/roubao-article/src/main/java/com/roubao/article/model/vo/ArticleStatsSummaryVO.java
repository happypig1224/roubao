package com.roubao.article.model.vo;

import java.io.Serial;
import java.io.Serializable;

/**
 * 文章大盘概览与冷热统计指标视图对象
 *
 * @author roubao
 * @since 2026-11-16
 */
public record ArticleStatsSummaryVO(
        Long totalArticles,
        Long publishedArticles,
        Long draftArticles,
        Long totalViews,
        Long totalLikes
) implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;
}

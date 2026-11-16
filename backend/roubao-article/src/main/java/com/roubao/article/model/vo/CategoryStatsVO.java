package com.roubao.article.model.vo;

import java.io.Serial;
import java.io.Serializable;

/**
 * 分类统计与文章关联计数视图对象
 *
 * @author roubao
 * @since 2026-11-16
 */
public record CategoryStatsVO(
        Long id,
        String categoryName,
        String categorySlug,
        String description,
        String iconName,
        Integer sortOrder,
        Long articleCount
) implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;
}

package com.roubao.article.model.vo;

import com.roubao.article.entity.CategoryDO;

import java.io.Serial;
import java.io.Serializable;

/**
 * 分类前台展示视图对象
 *
 * @author roubao
 * @since 2026-11-14
 */
public record CategoryVO(
        Long id,
        String categoryName,
        String categorySlug,
        String description,
        String iconName,
        Integer sortOrder
) implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 从持久化实体静态组装视图对象
     *
     * @param entity 分类实体
     * @return 分类视图对象
     */
    public static CategoryVO from(CategoryDO entity) {
        if (entity == null) {
            return null;
        }
        return new CategoryVO(
                entity.getId(),
                entity.getCategoryName(),
                entity.getCategorySlug(),
                entity.getDescription(),
                entity.getIconName(),
                entity.getSortOrder()
        );
    }
}

package com.roubao.article.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * 分类创建与更新入参 DTO
 *
 * @author roubao
 * @since 2026-11-16
 */
public record CategoryDTO(
        @NotBlank(message = "分类名称不能为空")
        @Size(max = 64, message = "分类名称不能超过64个字符")
        String categoryName,

        @NotBlank(message = "分类路由标识不能为空")
        @Pattern(regexp = "^[a-z0-9-]+$", message = "分类标识仅支持小写字母、数字与中划线")
        @Size(max = 64, message = "分类标识不能超过64个字符")
        String categorySlug,

        @Size(max = 255, message = "分类描述不能超过255个字符")
        String description,

        @Size(max = 64, message = "图标标识不能超过64个字符")
        String iconName,

        Integer sortOrder
) implements Serializable {
}

package com.roubao.article.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.List;

/**
 * 文章更新入参 DTO
 *
 * @author roubao
 * @since 2026-11-16
 */
public record ArticleUpdateDTO(
        @NotNull(message = "分类ID不能为空")
        Long categoryId,

        @NotBlank(message = "文章标题不能为空")
        @Size(max = 128, message = "文章标题不能超过128个字符")
        String title,

        @NotBlank(message = "路由标识不能为空")
        @Pattern(regexp = "^[a-z0-9-]+$", message = "路由标识仅支持小写字母、数字与中划线")
        String slug,

        @Size(max = 500, message = "摘要不能超过500个字符")
        String summary,

        String coverImageKey,

        List<String> tags,

        Integer readTimeMinutes,

        Integer sortOrder,

        Boolean published,

        Boolean top,

        Boolean featured,

        @NotBlank(message = "正文Markdown内容不能为空")
        String contentMarkdown
) implements Serializable {
}

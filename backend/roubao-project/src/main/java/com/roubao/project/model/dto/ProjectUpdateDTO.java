package com.roubao.project.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.List;

/**
 * 开源项目更新 DTO
 *
 * @author roubao
 * @since 2026-11-16
 */
public record ProjectUpdateDTO(
        @NotBlank(message = "项目名称不能为空")
        @Size(max = 64, message = "项目名称不能超过64个字符")
        String projectName,

        @NotBlank(message = "项目路由标识不能为空")
        @Pattern(regexp = "^[a-z0-9-]+$", message = "路由标识仅支持小写字母、数字与中划线")
        String slug,

        String tagline,

        String description,

        List<String> architectureHighlights,

        List<String> techTags,

        String repoUrl,

        String demoUrl,

        Integer starCount,

        String metricsSummary,

        Integer sortOrder,

        Boolean featured
) implements Serializable {

    public ProjectUpdateDTO {
        if (starCount == null) {
            starCount = 0;
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
        if (featured == null) {
            featured = false;
        }
    }
}

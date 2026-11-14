package com.roubao.project.model.vo;

import com.roubao.project.entity.ProjectDO;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * 开源项目展厅卡片视图对象
 *
 * @author roubao
 * @since 2026-11-14
 */
public record ProjectVO(
        Long id,
        String projectName,
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
        Boolean featured,
        LocalDateTime gmtCreate
) implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 静态组装项目展厅视图对象，执行深拷贝与数据防腐
     *
     * @param project 项目持久化实体
     * @return 项目视图对象
     */
    public static ProjectVO from(ProjectDO project) {
        if (project == null) {
            return null;
        }
        return new ProjectVO(
                project.getId(),
                project.getProjectName(),
                project.getSlug(),
                project.getTagline(),
                project.getDescription(),
                project.getArchitectureHighlights() != null
                        ? List.copyOf(project.getArchitectureHighlights())
                        : Collections.emptyList(),
                project.getTechTags() != null
                        ? List.copyOf(project.getTechTags())
                        : Collections.emptyList(),
                project.getRepoUrl(),
                project.getDemoUrl(),
                project.getStarCount() != null ? project.getStarCount() : 0,
                project.getMetricsSummary(),
                project.getSortOrder() != null ? project.getSortOrder() : 0,
                Boolean.TRUE.equals(project.getFeatured()),
                project.getGmtCreate()
        );
    }
}

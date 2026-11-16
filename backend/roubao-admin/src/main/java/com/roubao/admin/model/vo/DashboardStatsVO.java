package com.roubao.admin.model.vo;

import com.roubao.article.model.vo.CategoryStatsVO;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 管理端仪表盘大盘概览聚合统计视图对象
 *
 * @author roubao
 * @since 2026-11-16
 */
public record DashboardStatsVO(
        Long totalArticles,
        Long publishedArticles,
        Long draftArticles,
        Long totalProjects,
        Long totalViews,
        Long totalLikes,
        List<CategoryStatsVO> categoryStats
) implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;
}

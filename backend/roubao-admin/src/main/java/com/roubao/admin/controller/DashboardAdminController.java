package com.roubao.admin.controller;

import com.roubao.admin.model.vo.DashboardStatsVO;
import com.roubao.article.model.vo.ArticleStatsSummaryVO;
import com.roubao.article.model.vo.CategoryStatsVO;
import com.roubao.article.service.ArticleService;
import com.roubao.article.service.CategoryService;
import com.roubao.framework.common.Result;
import com.roubao.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 后台管理仪表盘大盘概览统计控制器
 *
 * @author roubao
 * @since 2026-11-16
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class DashboardAdminController {

    private final ArticleService articleService;
    private final ProjectService projectService;
    private final CategoryService categoryService;

    /**
     * 获取管理端大盘总览指标与分类分布数据
     *
     * @return 仪表盘大盘聚合统计 VO
     */
    @GetMapping("/stats")
    public Result<DashboardStatsVO> getDashboardStats() {
        ArticleStatsSummaryVO articleStats = articleService.getArticleStatsSummary();
        long totalProjects = projectService.countProjects();
        List<CategoryStatsVO> categoryStats = categoryService.listCategoryStats();

        DashboardStatsVO dashboardStats = new DashboardStatsVO(
                articleStats.totalArticles(),
                articleStats.publishedArticles(),
                articleStats.draftArticles(),
                totalProjects,
                articleStats.totalViews(),
                articleStats.totalLikes(),
                categoryStats
        );

        return Result.success(dashboardStats);
    }
}

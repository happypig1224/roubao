package com.roubao.project.controller;

import com.roubao.framework.common.PageResult;
import com.roubao.framework.common.Result;
import com.roubao.project.model.dto.ProjectQueryDTO;
import com.roubao.project.model.vo.ProjectVO;
import com.roubao.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 开源项目展厅前台门户 REST 接入控制器
 * 提供面向访客的开源实战项目列表、首页精选推荐及单项目详情
 *
 * @author roubao
 * @since 2026-11-14
 */
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectPortalController {

    private final ProjectService projectService;

    /**
     * 分页查询开源实战项目列表
     *
     * @param query 分页与过滤入参
     * @return 统一分页视图包装
     */
    @GetMapping
    public Result<PageResult<ProjectVO>> pageProjects(@Valid ProjectQueryDTO query) {
        PageResult<ProjectVO> pageResult = projectService.pageProjects(query);
        return Result.success(pageResult);
    }

    /**
     * 拉取首页精选推荐项目列表 (精选优先且按 Star 数降序)
     *
     * @return 精选项目列表
     */
    @GetMapping("/featured")
    public Result<List<ProjectVO>> listFeaturedProjects() {
        List<ProjectVO> featuredProjects = projectService.listFeaturedProjects();
        return Result.success(featuredProjects);
    }

    /**
     * 根据 Slug 路由标识查询开源项目详情
     *
     * @param slug 路径别名
     * @return 项目详情视图
     */
    @GetMapping("/{slug}")
    public Result<ProjectVO> getProjectBySlug(@PathVariable("slug") String slug) {
        ProjectVO project = projectService.getProjectBySlug(slug);
        return Result.success(project);
    }
}

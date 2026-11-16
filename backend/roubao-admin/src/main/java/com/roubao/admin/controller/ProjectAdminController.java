package com.roubao.admin.controller;

import com.roubao.framework.common.PageResult;
import com.roubao.framework.common.Result;
import com.roubao.project.model.dto.ProjectCreateDTO;
import com.roubao.project.model.dto.ProjectQueryDTO;
import com.roubao.project.model.dto.ProjectUpdateDTO;
import com.roubao.project.model.vo.ProjectVO;
import com.roubao.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 后台开源项目展厅管理 RESTful API 控制器
 *
 * @author roubao
 * @since 2026-11-16
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/projects")
@RequiredArgsConstructor
public class ProjectAdminController {

    private final ProjectService projectService;

    /**
     * 分页查询开源项目列表
     *
     * @param query 分页与搜索参数
     * @return 分页项目列表
     */
    @GetMapping
    public Result<PageResult<ProjectVO>> pageProjects(@Valid @ModelAttribute ProjectQueryDTO query) {
        return Result.success(projectService.pageProjects(query));
    }

    /**
     * 根据主键 ID 查询项目详情
     *
     * @param id 项目主键 ID
     * @return 项目详情视图对象
     */
    @GetMapping("/{id}")
    public Result<ProjectVO> getProjectById(@PathVariable Long id) {
        return Result.success(projectService.getProjectById(id));
    }

    /**
     * 新增开源项目
     *
     * @param dto 创建入参
     * @return 新增项目主键 ID
     */
    @PostMapping
    public Result<Long> createProject(@Valid @RequestBody ProjectCreateDTO dto) {
        Long id = projectService.createProject(dto);
        log.info("管理端新增开源项目成功: [id={}, name={}, slug={}]", id, dto.projectName(), dto.slug());
        return Result.success(id);
    }

    /**
     * 更新开源项目
     *
     * @param id  项目主键 ID
     * @param dto 更新入参
     * @return 空成功响应
     */
    @PutMapping("/{id}")
    public Result<Void> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectUpdateDTO dto) {
        projectService.updateProject(id, dto);
        log.info("管理端更新开源项目成功: [id={}, name={}, slug={}]", id, dto.projectName(), dto.slug());
        return Result.success();
    }

    /**
     * 逻辑删除开源项目
     *
     * @param id 项目主键 ID
     * @return 空成功响应
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        log.info("管理端删除开源项目成功: [id={}]", id);
        return Result.success();
    }
}

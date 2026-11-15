package com.roubao.project.service;

import com.roubao.framework.common.PageResult;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import com.roubao.project.entity.ProjectDO;
import com.roubao.project.model.dto.ProjectCreateDTO;
import com.roubao.project.model.dto.ProjectQueryDTO;
import com.roubao.project.model.vo.ProjectVO;

import java.util.List;

/**
 * 开源项目展厅业务领域服务接口
 *
 * @author roubao
 * @since 2026-11-14
 */
public interface ProjectService {

    /**
     * 分页查询开源项目展厅列表
     *
     * @param query 查询条件
     * @return 分页项目列表
     */
    PageResult<ProjectVO> pageProjects(ProjectQueryDTO query);

    /**
     * 拉取首页精选项目列表 (精选优先且按 Star 数降序)
     *
     * @return 精选项目列表
     */
    List<ProjectVO> listFeaturedProjects();

    /**
     * 根据 Slug 查询项目详情
     *
     * @param slug 路由标识
     * @return 项目详情 VO
     */
    ProjectVO getProjectBySlug(String slug);

    /**
     * 创建开源项目
     *
     * @param dto 项目创建入参 DTO
     * @return 项目主键 ID
     */
    Long createProject(ProjectCreateDTO dto);

    /**
     * 兼容重载：由实体入参适配为 DTO 调用
     *
     * @param project 项目实体
     * @return 项目主键 ID
     */
    default Long createProject(ProjectDO project) {
        if (project == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "项目实体不能为空");
        }
        ProjectCreateDTO dto = new ProjectCreateDTO(
                project.getProjectName(),
                project.getSlug(),
                project.getTagline(),
                project.getDescription(),
                project.getArchitectureHighlights(),
                project.getTechTags(),
                project.getRepoUrl(),
                project.getDemoUrl(),
                project.getStarCount(),
                project.getMetricsSummary(),
                project.getSortOrder(),
                project.getFeatured()
        );
        return createProject(dto);
    }
}


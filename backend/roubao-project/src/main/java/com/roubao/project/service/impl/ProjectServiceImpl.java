package com.roubao.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.roubao.framework.common.PageResult;
import com.roubao.framework.constant.CacheConstants;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import com.roubao.framework.redis.RedisUtils;
import com.roubao.project.entity.ProjectDO;
import com.roubao.project.mapper.ProjectMapper;
import com.roubao.project.model.dto.ProjectCreateDTO;
import com.roubao.project.model.dto.ProjectQueryDTO;
import com.roubao.project.model.vo.ProjectVO;
import com.roubao.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 开源项目展厅业务领域服务实现
 *
 * @author roubao
 * @since 2026-11-14
 */
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectMapper projectMapper;

    @Override
    public PageResult<ProjectVO> pageProjects(ProjectQueryDTO query) {
        long current = (query != null && query.getPageNo() != null) ? query.getPageNo() : 1L;
        long size = (query != null && query.getPageSize() != null) ? query.getPageSize() : 10L;

        Page<ProjectDO> page = new Page<>(current, size);
        LambdaQueryWrapper<ProjectDO> wrapper = new LambdaQueryWrapper<>();

        if (query != null) {
            if (Boolean.TRUE.equals(query.getFeaturedOnly())) {
                wrapper.eq(ProjectDO::getFeatured, true);
            }
            if (StringUtils.hasText(query.getKeyword())) {
                String kw = query.getKeyword().trim();
                wrapper.and(w -> w.like(ProjectDO::getProjectName, kw)
                        .or().like(ProjectDO::getTagline, kw)
                        .or().like(ProjectDO::getDescription, kw));
            }
        }

        // 默认排序：权重降序 + Star 数降序
        wrapper.orderByDesc(ProjectDO::getSortOrder)
                .orderByDesc(ProjectDO::getStarCount);

        Page<ProjectDO> resultPage = projectMapper.selectPage(page, wrapper);
        List<ProjectDO> records = resultPage.getRecords();
        if (records.isEmpty()) {
            return new PageResult<>(Collections.emptyList(), resultPage.getTotal(), current, size);
        }

        List<ProjectVO> voList = records.stream()
                .map(ProjectVO::from)
                .toList();

        return new PageResult<>(voList, resultPage.getTotal(), current, size);
    }

    @Override
    public List<ProjectVO> listFeaturedProjects() {
        return RedisUtils.getCacheObject(
                CacheConstants.PROJECT_FEATURED,
                CacheConstants.PROJECT_FEATURED_TTL.toSeconds(),
                TimeUnit.SECONDS,
                () -> {
                    LambdaQueryWrapper<ProjectDO> wrapper = new LambdaQueryWrapper<>();
                    wrapper.eq(ProjectDO::getFeatured, true)
                            .orderByDesc(ProjectDO::getStarCount)
                            .orderByDesc(ProjectDO::getSortOrder);

                    List<ProjectDO> list = projectMapper.selectList(wrapper);
                    return list.stream().map(ProjectVO::from).toList();
                }
        );
    }

    @Override
    public ProjectVO getProjectBySlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "项目 Slug 不能为空");
        }
        ProjectDO project = projectMapper.findBySlug(slug.trim())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        return ProjectVO.from(project);
    }

    @Override
    public ProjectVO getProjectById(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "项目 ID 不能为空");
        }
        ProjectDO project = projectMapper.selectById(id);
        if (project == null) {
            throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);
        }
        return ProjectVO.from(project);
    }

    @Override
    public void updateProject(Long id, com.roubao.project.model.dto.ProjectUpdateDTO dto) {
        if (id == null || dto == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "项目更新入参不能为空");
        }
        ProjectDO project = projectMapper.selectById(id);
        if (project == null) {
            throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);
        }

        project.setProjectName(dto.projectName().trim());
        project.setSlug(dto.slug().trim());
        project.setTagline(dto.tagline() != null ? dto.tagline().trim() : "");
        project.setDescription(dto.description() != null ? dto.description().trim() : "");
        project.setArchitectureHighlights(dto.architectureHighlights());
        project.setTechTags(dto.techTags());
        project.setRepoUrl(dto.repoUrl() != null ? dto.repoUrl().trim() : "");
        project.setDemoUrl(dto.demoUrl() != null ? dto.demoUrl().trim() : "");
        project.setStarCount(dto.starCount() != null ? dto.starCount() : 0);
        project.setMetricsSummary(dto.metricsSummary() != null ? dto.metricsSummary().trim() : "");
        project.setSortOrder(dto.sortOrder() != null ? dto.sortOrder() : 0);
        project.setFeatured(Boolean.TRUE.equals(dto.featured()));

        projectMapper.updateById(project);
        RedisUtils.deleteObject(CacheConstants.PROJECT_FEATURED);
    }

    @Override
    public void deleteProject(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "项目 ID 不能为空");
        }
        ProjectDO project = projectMapper.selectById(id);
        if (project == null) {
            throw new BusinessException(ErrorCode.PROJECT_NOT_FOUND);
        }
        projectMapper.deleteById(id);
        RedisUtils.deleteObject(CacheConstants.PROJECT_FEATURED);
    }

    @Override
    public long countProjects() {
        Long count = projectMapper.selectCount(null);
        return count != null ? count : 0L;
    }

    @Override
    public Long createProject(ProjectCreateDTO dto) {
        if (dto == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "项目创建参数不能为空");
        }
        ProjectDO project = new ProjectDO();
        project.setProjectName(dto.projectName());
        project.setSlug(dto.slug());
        project.setTagline(dto.tagline());
        project.setDescription(dto.description());
        project.setArchitectureHighlights(dto.architectureHighlights());
        project.setTechTags(dto.techTags());
        project.setRepoUrl(dto.repoUrl());
        project.setDemoUrl(dto.demoUrl());
        project.setStarCount(dto.starCount());
        project.setMetricsSummary(dto.metricsSummary());
        project.setSortOrder(dto.sortOrder());
        project.setFeatured(dto.featured());

        projectMapper.insert(project);
        // 主动核销精选推荐缓存
        RedisUtils.deleteObject(CacheConstants.PROJECT_FEATURED);
        return project.getId();
    }
}

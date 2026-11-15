package com.roubao.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.roubao.framework.common.PageResult;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import com.roubao.framework.redis.RedisCache;
import com.roubao.project.entity.ProjectDO;
import com.roubao.project.mapper.ProjectMapper;
import com.roubao.project.model.dto.ProjectQueryDTO;
import com.roubao.project.model.vo.ProjectVO;
import com.roubao.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
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

    public static final String CACHE_KEY_FEATURED_PROJECTS = "roubao:project:featured";

    private final ProjectMapper projectMapper;
    private final RedisCache redisCache;

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

    public List<ProjectVO> listFeaturedProjects() {
        return redisCache.getCacheObject(CACHE_KEY_FEATURED_PROJECTS, 6, TimeUnit.HOURS, () -> {
            LambdaQueryWrapper<ProjectDO> wrapper = new LambdaQueryWrapper<ProjectDO>();
            wrapper.eq(ProjectDO::getFeatured, true)
                    .orderByDesc(ProjectDO::getStarCount)
                    .orderByDesc(ProjectDO::getSortOrder);

            List<ProjectDO> list = projectMapper.selectList(wrapper);
            return list.stream().map(ProjectVO::from).toList();
        });
    }

    public ProjectVO getProjectBySlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "项目 Slug 不能为空");
        }
        ProjectDO project = projectMapper.findBySlug(slug.trim())
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        return ProjectVO.from(project);
    }

    public Long createProject(ProjectDO project) {
        if (project == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "项目实体不能为空");
        }
        projectMapper.insert(project);
        // 主动失效精选推荐缓存
        redisCache.deleteObject(CACHE_KEY_FEATURED_PROJECTS);
        return project.getId();
    }
}

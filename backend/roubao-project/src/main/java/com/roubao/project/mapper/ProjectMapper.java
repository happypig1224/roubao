package com.roubao.project.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.roubao.project.entity.ProjectDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

/**
 * 开源项目展厅持久层映射器
 *
 * @author roubao
 * @since 2026-11-13
 */
@Mapper
public interface ProjectMapper extends BaseMapper<ProjectDO> {

    /**
     * 根据 Slug 唯一标识查询未删除的项目
     *
     * @param slug 项目 URL 标识
     * @return 项目实体 Optional
     */
    default Optional<ProjectDO> findBySlug(String slug) {
        return Optional.ofNullable(selectOne(
                new LambdaQueryWrapper<ProjectDO>()
                        .eq(ProjectDO::getSlug, slug)
        ));
    }
}

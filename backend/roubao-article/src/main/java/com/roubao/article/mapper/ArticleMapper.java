package com.roubao.article.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.roubao.article.entity.ArticleDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

/**
 * 文章主体元数据持久层映射器
 *
 * @author roubao
 * @since 2026-11-13
 */
@Mapper
public interface ArticleMapper extends BaseMapper<ArticleDO> {

    /**
     * 根据 Slug 唯一路由标识查询未删除的文章
     *
     * @param slug 路径标识
     * @return 文章实体 Optional
     */
    default Optional<ArticleDO> findBySlug(String slug) {
        return Optional.ofNullable(selectOne(
                new LambdaQueryWrapper<ArticleDO>()
                        .eq(ArticleDO::getSlug, slug)
        ));
    }
}

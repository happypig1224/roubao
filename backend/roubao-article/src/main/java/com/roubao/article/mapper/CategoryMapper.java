package com.roubao.article.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.roubao.article.entity.CategoryDO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 文章分类持久层映射器
 *
 * @author roubao
 * @since 2026-11-13
 */
@Mapper
public interface CategoryMapper extends BaseMapper<CategoryDO> {
}

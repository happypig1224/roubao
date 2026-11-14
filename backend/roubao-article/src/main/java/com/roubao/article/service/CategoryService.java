package com.roubao.article.service;

import com.roubao.article.model.vo.CategoryVO;

import java.util.List;

/**
 * 分类业务领域服务接口
 *
 * @author roubao
 * @since 2026-11-14
 */
public interface CategoryService {

    /**
     * 获取全部分类列表 (按排序权重降序排列)
     *
     * @return 分类 VO 列表
     */
    List<CategoryVO> listCategories();

    /**
     * 根据分类 ID 查询分类详情
     *
     * @param id 分类 ID
     * @return 分类 VO
     */
    CategoryVO getCategoryById(Long id);
}


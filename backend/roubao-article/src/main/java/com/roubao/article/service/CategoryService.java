package com.roubao.article.service;

import com.roubao.article.model.dto.CategoryDTO;
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
     * 获取全部分类及关联文章统计列表
     *
     * @return 分类统计 VO 列表
     */
    List<com.roubao.article.model.vo.CategoryStatsVO> listCategoryStats();

    /**
     * 根据分类 ID 查询分类详情
     *
     * @param id 分类 ID
     * @return 分类 VO
     */
    CategoryVO getCategoryById(Long id);

    /**
     * 创建分类
     *
     * @param dto 分类入参 DTO
     * @return 分类 ID
     */
    Long createCategory(CategoryDTO dto);

    /**
     * 更新分类信息
     *
     * @param id  分类 ID
     * @param dto 分类入参 DTO
     */
    void updateCategory(Long id, CategoryDTO dto);

    /**
     * 删除分类 (校验关联文章，有文章则阻断)
     *
     * @param id 分类 ID
     */
    void deleteCategory(Long id);
}

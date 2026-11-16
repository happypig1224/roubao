package com.roubao.admin.controller;

import com.roubao.article.model.dto.CategoryDTO;
import com.roubao.article.model.vo.CategoryStatsVO;
import com.roubao.article.model.vo.CategoryVO;
import com.roubao.article.service.CategoryService;
import com.roubao.framework.common.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 后台分类管理 RESTful API 控制器
 *
 * @author roubao
 * @since 2026-11-16
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class CategoryAdminController {

    private final CategoryService categoryService;

    /**
     * 获取全部分类及关联文章统计列表
     *
     * @return 分类统计列表
     */
    @GetMapping
    public Result<List<CategoryStatsVO>> listCategoryStats() {
        return Result.success(categoryService.listCategoryStats());
    }

    /**
     * 根据主键 ID 查询分类详情
     *
     * @param id 分类主键 ID
     * @return 分类视图对象
     */
    @GetMapping("/{id}")
    public Result<CategoryVO> getCategoryById(@PathVariable Long id) {
        return Result.success(categoryService.getCategoryById(id));
    }

    /**
     * 创建新分类
     *
     * @param dto 分类创建入参
     * @return 新增分类主键 ID
     */
    @PostMapping
    public Result<Long> createCategory(@Valid @RequestBody CategoryDTO dto) {
        Long id = categoryService.createCategory(dto);
        log.info("管理端创建分类成功: [id={}, name={}, slug={}]", id, dto.categoryName(), dto.categorySlug());
        return Result.success(id);
    }

    /**
     * 更新分类信息
     *
     * @param id  分类主键 ID
     * @param dto 分类更新入参
     * @return 空成功响应
     */
    @PutMapping("/{id}")
    public Result<Void> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO dto) {
        categoryService.updateCategory(id, dto);
        log.info("管理端更新分类成功: [id={}, name={}, slug={}]", id, dto.categoryName(), dto.categorySlug());
        return Result.success();
    }

    /**
     * 逻辑删除指定分类 (若有绑定文章则安全阻断)
     *
     * @param id 分类主键 ID
     * @return 空成功响应
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        log.info("管理端删除分类成功: [id={}]", id);
        return Result.success();
    }
}

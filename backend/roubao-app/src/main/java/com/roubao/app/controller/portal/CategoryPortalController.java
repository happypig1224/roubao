package com.roubao.app.controller.portal;

import com.roubao.article.model.vo.CategoryVO;
import com.roubao.article.service.CategoryService;
import com.roubao.framework.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 分类前台门户 REST 接入控制器
 * 提供面向访客的全站文章分类字典与导航数据
 *
 * @author roubao
 * @since 2026-11-14
 */
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryPortalController {

    private final CategoryService categoryService;

    /**
     * 获取全部分类字典列表 (按后台权重排序)
     *
     * @return 分类视图对象列表
     */
    @GetMapping
    public Result<List<CategoryVO>> listCategories() {
        List<CategoryVO> categories = categoryService.listCategories();
        return Result.success(categories);
    }

    /**
     * 根据主键 ID 查询单个分类详情
     *
     * @param id 分类 ID
     * @return 分类视图对象
     */
    @GetMapping("/{id}")
    public Result<CategoryVO> getCategoryById(@PathVariable("id") Long id) {
        CategoryVO category = categoryService.getCategoryById(id);
        return Result.success(category);
    }
}


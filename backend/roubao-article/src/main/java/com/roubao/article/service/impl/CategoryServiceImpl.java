package com.roubao.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.roubao.article.entity.CategoryDO;
import com.roubao.article.mapper.CategoryMapper;
import com.roubao.article.model.vo.CategoryVO;
import com.roubao.article.service.CategoryService;
import com.roubao.framework.constant.CacheConstants;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import com.roubao.framework.redis.RedisUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.roubao.article.entity.ArticleDO;
import com.roubao.article.mapper.ArticleMapper;
import com.roubao.article.model.dto.CategoryDTO;
import org.springframework.transaction.annotation.Transactional;

/**
 * 分类业务领域服务实现
 *
 * @author roubao
 * @since 2026-11-14
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final ArticleMapper articleMapper;

    @Override
    public List<CategoryVO> listCategories() {
        return RedisUtils.getCacheObject(
                CacheConstants.CATEGORY_LIST,
                CacheConstants.CATEGORY_LIST_TTL.toSeconds(),
                TimeUnit.SECONDS,
                () -> {
                    LambdaQueryWrapper<CategoryDO> queryWrapper = new LambdaQueryWrapper<>();
                    queryWrapper.orderByDesc(CategoryDO::getSortOrder)
                            .orderByDesc(CategoryDO::getId);

                    List<CategoryDO> list = categoryMapper.selectList(queryWrapper);
                    return list.stream().map(CategoryVO::from).toList();
                }
        );
    }

    @Override
    public List<com.roubao.article.model.vo.CategoryStatsVO> listCategoryStats() {
        LambdaQueryWrapper<CategoryDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByDesc(CategoryDO::getSortOrder)
                .orderByDesc(CategoryDO::getId);
        List<CategoryDO> list = categoryMapper.selectList(queryWrapper);
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }

        return list.stream().map(c -> {
            Long count = articleMapper.selectCount(
                    new LambdaQueryWrapper<ArticleDO>().eq(ArticleDO::getCategoryId, c.getId())
            );
            return new com.roubao.article.model.vo.CategoryStatsVO(
                    c.getId(),
                    c.getCategoryName(),
                    c.getCategorySlug(),
                    c.getDescription(),
                    c.getIconName(),
                    c.getSortOrder(),
                    count != null ? count : 0L
            );
        }).toList();
    }

    @Override
    public CategoryVO getCategoryById(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "分类 ID 不能为空");
        }
        CategoryDO category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        return CategoryVO.from(category);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createCategory(CategoryDTO dto) {
        if (dto == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "分类创建入参不能为空");
        }
        CategoryDO categoryDO = new CategoryDO();
        categoryDO.setCategoryName(dto.categoryName().trim());
        categoryDO.setCategorySlug(dto.categorySlug().trim());
        categoryDO.setDescription(dto.description() != null ? dto.description().trim() : "");
        categoryDO.setIconName(dto.iconName() != null ? dto.iconName().trim() : "");
        categoryDO.setSortOrder(dto.sortOrder() != null ? dto.sortOrder() : 0);

        categoryMapper.insert(categoryDO);
        RedisUtils.deleteObject(CacheConstants.CATEGORY_LIST);
        return categoryDO.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateCategory(Long id, CategoryDTO dto) {
        if (id == null || dto == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "分类更新入参不能为空");
        }
        CategoryDO existing = categoryMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        existing.setCategoryName(dto.categoryName().trim());
        existing.setCategorySlug(dto.categorySlug().trim());
        existing.setDescription(dto.description() != null ? dto.description().trim() : "");
        existing.setIconName(dto.iconName() != null ? dto.iconName().trim() : "");
        existing.setSortOrder(dto.sortOrder() != null ? dto.sortOrder() : 0);

        categoryMapper.updateById(existing);
        RedisUtils.deleteObject(CacheConstants.CATEGORY_LIST);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "分类 ID 不能为空");
        }
        CategoryDO existing = categoryMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        Long count = articleMapper.selectCount(
                new LambdaQueryWrapper<ArticleDO>().eq(ArticleDO::getCategoryId, id)
        );
        if (count != null && count > 0) {
            throw new BusinessException(ErrorCode.CATEGORY_IN_USE);
        }
        categoryMapper.deleteById(id);
        RedisUtils.deleteObject(CacheConstants.CATEGORY_LIST);
    }
}

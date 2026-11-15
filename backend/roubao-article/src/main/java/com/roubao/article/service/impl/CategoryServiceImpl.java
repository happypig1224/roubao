package com.roubao.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.roubao.article.entity.CategoryDO;
import com.roubao.article.mapper.CategoryMapper;
import com.roubao.article.model.vo.CategoryVO;
import com.roubao.article.service.CategoryService;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import com.roubao.framework.redis.RedisCache;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 分类业务领域服务实现
 *
 * @author roubao
 * @since 2026-11-14
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    public static final String CACHE_KEY_CATEGORY_LIST = "roubao:category:list";

    private final CategoryMapper categoryMapper;
    private final RedisCache redisCache;

    public List<CategoryVO> listCategories() {
        return redisCache.getCacheObject(CACHE_KEY_CATEGORY_LIST, 24, TimeUnit.HOURS, () -> {
            LambdaQueryWrapper<CategoryDO> queryWrapper = new LambdaQueryWrapper<CategoryDO>();
            queryWrapper.orderByDesc(CategoryDO::getSortOrder)
                    .orderByDesc(CategoryDO::getId);

            List<CategoryDO> list = categoryMapper.selectList(queryWrapper);
            return list.stream().map(CategoryVO::from).toList();
        });
    }

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
}

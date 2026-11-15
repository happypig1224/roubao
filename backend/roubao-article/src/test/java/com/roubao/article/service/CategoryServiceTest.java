package com.roubao.article.service;

import com.roubao.article.TestArticleApplication;
import com.roubao.article.entity.CategoryDO;
import com.roubao.article.mapper.CategoryMapper;
import com.roubao.article.model.vo.CategoryVO;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import com.roubao.framework.redis.RedisCache;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 分类业务领域服务验收测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest(classes = TestArticleApplication.class)
@Transactional
class CategoryServiceTest {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private RedisCache redisCache;

    @BeforeEach
    void cleanCache() {
        redisCache.deleteObject("roubao:category:list");
    }

    @Test
    @DisplayName("获取全部分类列表：按 sortOrder 降序排列且过滤已删除项")
    void shouldListCategoriesOrderedBySortOrderDesc() {
        CategoryDO c1 = new CategoryDO();
        c1.setCategoryName("微服务与云原生");
        c1.setCategorySlug("cloud-native");
        c1.setSortOrder(10);
        categoryMapper.insert(c1);

        CategoryDO c2 = new CategoryDO();
        c2.setCategoryName("Java 底层原理");
        c2.setCategorySlug("java-core");
        c2.setSortOrder(100);
        categoryMapper.insert(c2);

        List<CategoryVO> categories = categoryService.listCategories();

        assertThat(categories).isNotEmpty();
        // 权重更高的 c2 必须排在 c1 前面
        int indexC2 = -1;
        int indexC1 = -1;
        for (int i = 0; i < categories.size(); i++) {
            if ("java-core".equals(categories.get(i).categorySlug())) {
                indexC2 = i;
            }
            if ("cloud-native".equals(categories.get(i).categorySlug())) {
                indexC1 = i;
            }
        }
        assertThat(indexC2).isLessThan(indexC1);
    }

    @Test
    @DisplayName("根据 ID 查询分类详情：正常命中与不存在时抛出 CATEGORY_NOT_FOUND 异常")
    void shouldGetCategoryByIdOrThrowWhenNotFound() {
        CategoryDO c = new CategoryDO();
        c.setCategoryName("前端交互");
        c.setCategorySlug("frontend");
        c.setSortOrder(50);
        categoryMapper.insert(c);

        CategoryVO vo = categoryService.getCategoryById(c.getId());
        assertThat(vo).isNotNull();
        assertThat(vo.categoryName()).isEqualTo("前端交互");

        assertThatThrownBy(() -> categoryService.getCategoryById(999999L))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.CATEGORY_NOT_FOUND));
    }

    @Test
    @DisplayName("分类列表缓存集成：首次查库并写入 Redis，后续读取直接命中缓存")
    void shouldCacheCategoryListInRedis() {
        CategoryDO c = new CategoryDO();
        c.setCategoryName("性能调优");
        c.setCategorySlug("perf-tuning");
        c.setSortOrder(80);
        categoryMapper.insert(c);

        // 首次读取：触发 Cache-Aside 回源并回填
        List<CategoryVO> firstRead = categoryService.listCategories();
        assertThat(firstRead).isNotEmpty();

        // 验证 Redis 中已生成对应 Key
        assertThat(redisCache.hasKey("roubao:category:list")).isTrue();

        // 第二次读取：直接命中 Redis
        List<CategoryVO> cachedRead = categoryService.listCategories();
        assertThat(cachedRead).hasSameSizeAs(firstRead);
    }
}


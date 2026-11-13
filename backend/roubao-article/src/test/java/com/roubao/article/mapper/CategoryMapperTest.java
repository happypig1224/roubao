package com.roubao.article.mapper;

import com.roubao.article.entity.CategoryDO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 分类持久层映射与逻辑删除行为单元测试
 *
 * @author roubao
 * @since 2026-11-13
 */
@SpringBootTest
@Transactional
class CategoryMapperTest {

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("应该成功插入分类并在软删除后物理保留但逻辑过滤")
    void shouldInsertAndSoftDeleteCategoryCorrectly() {
        // Arrange
        CategoryDO category = new CategoryDO();
        category.setCategoryName("后端架构");
        category.setCategorySlug("backend");
        category.setDescription("Java 21 与高性能系统设计");
        category.setIconName("Server");
        category.setSortOrder(100);
        category.setDeleted(false);

        // Act - 插入
        int insertRows = categoryMapper.insert(category);
        assertThat(insertRows).isEqualTo(1);
        assertThat(category.getId()).isNotNull();

        // Assert - 插入后通过 MyBatis-Plus 查询
        CategoryDO queried = categoryMapper.selectById(category.getId());
        assertThat(queried).isNotNull();
        assertThat(queried.getCategoryName()).isEqualTo("后端架构");
        assertThat(queried.getCategorySlug()).isEqualTo("backend");
        assertThat(queried.getDeleted()).isFalse();

        // Act - 逻辑删除
        int deleteRows = categoryMapper.deleteById(category.getId());
        assertThat(deleteRows).isEqualTo(1);

        // Assert - MyBatis-Plus 查询自动带上 is_deleted = 0，结果应为 null
        CategoryDO afterDelete = categoryMapper.selectById(category.getId());
        assertThat(afterDelete).isNull();

        // Assert - 穿透底层物理数据库，核验物理行存在且 is_deleted 字段确为 1
        Integer rawDeletedFlag = jdbcTemplate.queryForObject(
                "SELECT is_deleted FROM tb_category WHERE id = ?",
                Integer.class,
                category.getId()
        );
        assertThat(rawDeletedFlag).isEqualTo(1);
    }
}

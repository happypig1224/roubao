package com.roubao.article.model.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 文章列表查询入参校验单元测试
 *
 * @author roubao
 * @since 2026-11-14
 */
class ArticleDtoValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("ArticleQueryDTO - 合法分页与筛选入参应校验通过")
    void shouldPassValidationWhenArticleQueryDtoIsValid() {
        ArticleQueryDTO query = new ArticleQueryDTO();
        query.setPageNo(1L);
        query.setPageSize(20L);
        query.setCategoryId(2L);
        query.setTag("Java 21");
        query.setKeyword("虚拟线程");
        query.setPublishedOnly(true);

        Set<ConstraintViolation<ArticleQueryDTO>> violations = validator.validate(query);

        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("ArticleQueryDTO - 分页参数超出边界 (pageNo<1 或 pageSize>100) 时应精准拦截")
    void shouldFailValidationWhenPaginationIsOutOfBound() {
        ArticleQueryDTO query = new ArticleQueryDTO();
        query.setPageNo(0L);
        query.setPageSize(200L);

        Set<ConstraintViolation<ArticleQueryDTO>> violations = validator.validate(query);

        assertThat(violations).hasSize(2);
        List<String> properties = violations.stream()
                .map(v -> v.getPropertyPath().toString())
                .toList();
        assertThat(properties).containsExactlyInAnyOrder("pageNo", "pageSize");
    }

    @Test
    @DisplayName("ArticleQueryDTO - 分类ID非法或检索词过长时应报错")
    void shouldFailValidationWhenFilterFieldsAreInvalid() {
        ArticleQueryDTO query = new ArticleQueryDTO();
        query.setCategoryId(0L);
        query.setTag("A".repeat(33));
        query.setKeyword("B".repeat(65));

        Set<ConstraintViolation<ArticleQueryDTO>> violations = validator.validate(query);

        assertThat(violations).hasSize(3);
        List<String> properties = violations.stream()
                .map(v -> v.getPropertyPath().toString())
                .toList();
        assertThat(properties).containsExactlyInAnyOrder("categoryId", "tag", "keyword");
    }
}

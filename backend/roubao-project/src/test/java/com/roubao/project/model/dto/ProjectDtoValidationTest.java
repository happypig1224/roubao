package com.roubao.project.model.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 开源项目展厅查询入参校验单元测试
 *
 * @author roubao
 * @since 2026-11-14
 */
class ProjectDtoValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("ProjectQueryDTO - 合法分页与精选筛选参数应校验通过")
    void shouldPassValidationWhenProjectQueryDtoIsValid() {
        ProjectQueryDTO query = new ProjectQueryDTO();
        query.setPageNo(1L);
        query.setPageSize(10L);
        query.setFeaturedOnly(true);
        query.setKeyword("Gateway");

        Set<ConstraintViolation<ProjectQueryDTO>> violations = validator.validate(query);

        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("ProjectQueryDTO - 每页大小超出 100 限制时应报错")
    void shouldFailValidationWhenProjectQueryDtoPageSizeExceedsLimit() {
        ProjectQueryDTO query = new ProjectQueryDTO();
        query.setPageSize(101L);

        Set<ConstraintViolation<ProjectQueryDTO>> violations = validator.validate(query);

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getPropertyPath().toString()).isEqualTo("pageSize");
    }

    @Test
    @DisplayName("ProjectQueryDTO - 关键字过长时应精准拦截")
    void shouldFailValidationWhenKeywordExceedsLength() {
        ProjectQueryDTO query = new ProjectQueryDTO();
        query.setKeyword("K".repeat(65));

        Set<ConstraintViolation<ProjectQueryDTO>> violations = validator.validate(query);

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getPropertyPath().toString()).isEqualTo("keyword");
    }
}

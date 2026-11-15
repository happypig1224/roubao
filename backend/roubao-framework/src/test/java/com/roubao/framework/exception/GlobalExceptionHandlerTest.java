package com.roubao.framework.exception;

import com.roubao.framework.common.Result;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 全局异常处理器单元测试
 *
 * @author roubao
 * @since 2026-11-15
 */
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("当捕获 DuplicateKeyException 时应转换为 409 Conflict 错误并返回友好的业务提示")
    void shouldHandleDuplicateKeyExceptionAsConflict() {
        DuplicateKeyException ex = new DuplicateKeyException("Duplicate entry 'slug-test' for key 'uk_article_slug'");
        Result<Void> result = handler.handleDuplicateKeyException(ex);

        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(ErrorCode.CONFLICT.getCode());
        assertThat(result.getMessage()).isEqualTo("数据已存在或路由标识冲突");
    }
}

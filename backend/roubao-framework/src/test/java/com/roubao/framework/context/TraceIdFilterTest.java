package com.roubao.framework.context;

import com.roubao.framework.common.Result;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 全链路日志 TraceId 与 Nginx Request-ID 规范化测试
 *
 * @author roubao
 * @since 2026-11-14
 */
class TraceIdFilterTest {

    private final TraceIdFilter filter = new TraceIdFilter();

    @Test
    @DisplayName("当请求携带 Nginx X-Request-ID 时应优先继承该链路标识并在响应头和 Result 中透传")
    void shouldInheritNginxRequestId() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Request-ID", "nginx-uuid-12345678");

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            assertThat(MDC.get("traceId")).isEqualTo("nginx-uuid-12345678");
            Result<String> result = Result.success("ok");
            assertThat(result.getTraceId()).isEqualTo("nginx-uuid-12345678");
        });

        assertThat(response.getHeader("X-Request-ID")).isEqualTo("nginx-uuid-12345678");
        assertThat(response.getHeader("X-Trace-Id")).isEqualTo("nginx-uuid-12345678");
        assertThat(MDC.get("traceId")).isNull(); // 验证请求结束后清理
    }

    @Test
    @DisplayName("当请求仅携带 X-Trace-Id 时应正确继承并在双头中回写")
    void shouldInheritTraceIdHeader() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Trace-Id", "trace-client-8888");

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            assertThat(MDC.get("traceId")).isEqualTo("trace-client-8888");
        });

        assertThat(response.getHeader("X-Request-ID")).isEqualTo("trace-client-8888");
        assertThat(response.getHeader("X-Trace-Id")).isEqualTo("trace-client-8888");
        assertThat(MDC.get("traceId")).isNull();
    }

    @Test
    @DisplayName("当未携带追踪头时应自动生成 32 位 UUID 并在响应头注入")
    void shouldGenerateUUIDWhenNoHeaderPresent() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            String mdcId = MDC.get("traceId");
            assertThat(mdcId).isNotNull().hasSize(32);
        });

        assertThat(response.getHeader("X-Request-ID")).isNotNull().hasSize(32);
        assertThat(response.getHeader("X-Trace-Id")).isNotNull().hasSize(32);
        assertThat(MDC.get("traceId")).isNull();
    }
}

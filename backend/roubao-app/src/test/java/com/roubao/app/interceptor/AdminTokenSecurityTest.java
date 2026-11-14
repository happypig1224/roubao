package com.roubao.app.interceptor;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 管理员凭证安全与生产弱口令阻断门禁测试
 *
 * @author roubao
 * @since 2026-11-14
 */
class AdminTokenSecurityTest {

    @Test
    @DisplayName("生产环境下若使用默认弱口令必须阻断容器启动")
    void shouldFailInProdWithDefaultWeakToken() {
        AdminAuthInterceptor interceptor = new AdminAuthInterceptor();
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        interceptor.setEnvironment(env);
        interceptor.setConfiguredToken("roubao-admin-secret-token");

        assertThatThrownBy(interceptor::validateAdminToken)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("生产环境安全红线阻断");
    }

    @Test
    @DisplayName("生产环境下若Token过短(<16位)必须阻断容器启动")
    void shouldFailInProdWithShortToken() {
        AdminAuthInterceptor interceptor = new AdminAuthInterceptor();
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        interceptor.setEnvironment(env);
        interceptor.setConfiguredToken("short-12345");

        assertThatThrownBy(interceptor::validateAdminToken)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("不得小于16位");
    }

    @Test
    @DisplayName("生产环境下若配置高强度Token应通过安全校验")
    void shouldPassInProdWithStrongToken() {
        AdminAuthInterceptor interceptor = new AdminAuthInterceptor();
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        interceptor.setEnvironment(env);
        interceptor.setConfiguredToken("prod-secure-token-99887766554433221100");

        assertThatCode(interceptor::validateAdminToken)
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("非生产开发环境下允许使用默认Token以便本地联调")
    void shouldPassInDevWithDefaultToken() {
        AdminAuthInterceptor interceptor = new AdminAuthInterceptor();
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("dev");

        interceptor.setEnvironment(env);
        interceptor.setConfiguredToken("roubao-admin-secret-token");

        assertThatCode(interceptor::validateAdminToken)
                .doesNotThrowAnyException();
    }
}

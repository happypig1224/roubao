package com.roubao.admin.interceptor;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * [TICKET-P0-1] 生产凭证强制校验与默认弱口令启动熔断单元测试
 *
 * @author roubao
 * @since 2026-11-14
 */
class AdminTokenSecurityTest {

    @Test
    @DisplayName("生产环境 (prod) 且未配置 Token 时：必须立即抛出异常阻断启动")
    void shouldFailStartupWhenTokenNotSetInProdProfile() {
        AdminAuthInterceptor interceptor = new AdminAuthInterceptor();
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        interceptor.setEnvironment(env);
        interceptor.setConfiguredToken(null);

        assertThatThrownBy(interceptor::validateAdminToken)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("生产环境安全红线阻断");
    }

    @Test
    @DisplayName("生产环境 (prod) 且使用默认弱口令时：必须立即抛出异常阻断启动")
    void shouldFailStartupWhenDefaultWeakTokenUsedInProdProfile() {
        AdminAuthInterceptor interceptor = new AdminAuthInterceptor();
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        interceptor.setEnvironment(env);
        interceptor.setConfiguredToken("roubao-admin-secret-token");

        assertThatThrownBy(interceptor::validateAdminToken)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("禁止使用默认口令");
    }

    @Test
    @DisplayName("生产环境 (prod) 密钥长度小于 16 位时：必须立即抛出异常阻断启动")
    void shouldFailStartupWhenShortTokenUsedInProdProfile() {
        AdminAuthInterceptor interceptor = new AdminAuthInterceptor();
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");

        interceptor.setEnvironment(env);
        interceptor.setConfiguredToken("short-pass-123");

        assertThatThrownBy(interceptor::validateAdminToken)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("密钥长度不得小于16位");
    }

    @Test
    @DisplayName("非生产环境 (dev) 或配置合格生产口令时：平滑放行，不发生熔断")
    void shouldPassValidationInDevOrWithStrongProdToken() {
        AdminAuthInterceptor interceptor = new AdminAuthInterceptor();
        MockEnvironment devEnv = new MockEnvironment();
        devEnv.setActiveProfiles("dev");

        interceptor.setEnvironment(devEnv);
        interceptor.setConfiguredToken("roubao-admin-secret-token");
        assertThatCode(interceptor::validateAdminToken).doesNotThrowAnyException();

        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");
        interceptor.setEnvironment(prodEnv);
        interceptor.setConfiguredToken("Production-Super-Strong-Key-2026-Secure#!");
        assertThatCode(interceptor::validateAdminToken).doesNotThrowAnyException();
    }
}

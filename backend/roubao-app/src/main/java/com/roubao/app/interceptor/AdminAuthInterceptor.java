package com.roubao.app.interceptor;

import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.security.MessageDigest;
import java.util.Arrays;

/**
 * 后台管理路由 Admin Token 鉴权拦截器
 * 拦截 /api/v1/admin/** 路径，校验 X-Admin-Token 请求头
 * 内置生产环境默认弱口令启动熔断保护
 *
 * @author roubao
 * @since 2026-11-14
 */
@Component
@Setter
public class AdminAuthInterceptor implements HandlerInterceptor {

    private static final String ADMIN_TOKEN_HEADER = "X-Admin-Token";
    private static final String DEFAULT_WEAK_TOKEN = "roubao-admin-secret-token";

    @Value("${roubao.admin.token:roubao-admin-secret-token}")
    private String configuredToken;

    @Autowired(required = false)
    private Environment environment;

    @PostConstruct
    public void validateAdminToken() {
        if (environment == null) {
            return;
        }

        String[] activeProfiles = environment.getActiveProfiles();
        boolean isProd = Arrays.asList(activeProfiles).contains("prod");
        if (isProd) {
            if (!StringUtils.hasText(configuredToken)
                    || DEFAULT_WEAK_TOKEN.equalsIgnoreCase(configuredToken.trim())) {
                throw new IllegalStateException("【生产环境安全红线阻断】生产环境必须通过环境变量 ADMIN_TOKEN 配置专用高强度密钥，禁止使用默认口令！");
            }
            if (configuredToken.trim().length() < 16) {
                throw new IllegalStateException("【生产环境安全红线阻断】生产环境 ADMIN_TOKEN 安全密钥长度不得小于16位！");
            }
        }
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader(ADMIN_TOKEN_HEADER);
        if (!StringUtils.hasText(token)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "缺少管理员凭证 X-Admin-Token");
        }

        // 使用恒定时间对比防止基于响应时序的时序攻击 (Timing Attack)
        if (!MessageDigest.isEqual(token.trim().getBytes(), configuredToken.trim().getBytes())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "管理员凭证无效，拒绝访问");
        }

        return true;
    }
}

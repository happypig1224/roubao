package com.roubao.admin.config;

import com.roubao.admin.interceptor.AdminAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 后台管理模块 Web MVC 拦截器配置
 * 专职负责将 AdminAuthInterceptor 挂载至 /api/v1/admin/** 路径
 *
 * @author roubao
 * @since 2026-11-14
 */
@Configuration
@RequiredArgsConstructor
public class AdminWebMvcConfig implements WebMvcConfigurer {

    private final AdminAuthInterceptor adminAuthInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/api/v1/admin/**");
    }
}

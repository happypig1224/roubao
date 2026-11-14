package com.roubao.app.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

/**
 * 全局 Web MVC 配置
 * 负责跨源资源共享 (CORS) 白名单策略收敛，禁止携带凭证时开放通配符 Origin
 *
 * @author roubao
 * @since 2026-11-14
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${roubao.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000}")
    private String allowedOriginsConfig;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = Arrays.stream(allowedOriginsConfig.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();

        registry.addMapping("/api/**")
                .allowedOriginPatterns(origins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

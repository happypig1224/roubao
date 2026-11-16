package com.roubao.admin;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * roubao-admin 单元与集成测试专用的 Spring Boot 测试上下文装配类
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootApplication(scanBasePackages = {"com.roubao.admin", "com.roubao.article", "com.roubao.project", "com.roubao.framework"})
@MapperScan({"com.roubao.article.mapper", "com.roubao.project.mapper"})
public class TestAdminApplication {
}

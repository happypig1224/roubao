package com.roubao.project;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 项目展厅模块单元测试 Spring Boot 上下文
 *
 * @author roubao
 * @since 2026-11-13
 */
@SpringBootApplication(scanBasePackages = {"com.roubao.project", "com.roubao.framework"})
@MapperScan("com.roubao.project.mapper")
public class TestProjectApplication {
}

package com.roubao.app;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 肉包博客与开源展厅系统 (roubao) 服务主启动类
 * 聚合装配基础设施、文章领域与开源项目领域，提供对外统一 HTTP 服务入口
 *
 * @author roubao
 * @since 2026-11-13
 */
@SpringBootApplication(scanBasePackages = "com.roubao")
@MapperScan("com.roubao.**.mapper")
public class RoubaoApplication {

    /**
     * Spring Boot 主运行入口
     *
     * @param args 命令行启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(RoubaoApplication.class, args);
    }
}

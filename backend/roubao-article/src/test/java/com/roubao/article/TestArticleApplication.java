package com.roubao.article;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 单元测试专用的 Spring Boot 测试上下文装配类
 *
 * @author roubao
 * @since 2026-11-13
 */
@SpringBootApplication
@MapperScan("com.roubao.article.mapper")
public class TestArticleApplication {
}

package com.roubao.app.controller.admin;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 后台文章管理与 Markdown 上传接口验收测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest
@AutoConfigureMockMvc
class ArticleAdminControllerTest {

    private static final String ADMIN_TOKEN_HEADER = "X-Admin-Token";
    private static final String VALID_ADMIN_TOKEN = "roubao-admin-secret-token";

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("鉴权拦截断言：缺少 Token 或 Token 错误时返回 401 拒绝访问")
    void shouldRejectWhenTokenIsMissingOrInvalid() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.md",
                "text/markdown",
                "# 简单正文".getBytes(StandardCharsets.UTF_8)
        );

        // 1. 无 Token
        mockMvc.perform(multipart("/api/v1/admin/articles/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));

        // 2. 错误 Token
        mockMvc.perform(multipart("/api/v1/admin/articles/upload")
                        .file(file)
                        .header(ADMIN_TOKEN_HEADER, "wrong-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("Markdown 文档上传：解析 Frontmatter 并原子入库，返回新文章 ID 且可通过 Slug 查得")
    void shouldUploadMarkdownWithFrontmatterSuccessfully() throws Exception {
        String markdownWithFrontmatter = """
                ---
                title: "MySQL 8.0 索引跳跃扫描实战分析"
                slug: "mysql-8-index-skip-scan"
                category: "architecture"
                tags: ["MySQL", "数据库", "索引"]
                summary: "深度解析 MySQL 8.0 Index Skip Scan 原理与组合索引优化技巧"
                weight: 5
                ---
                # 索引跳跃扫描
                
                当查询条件不满足最左前缀原则时，MySQL 8.0 支持跳过联合索引前导列...
                """;

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "mysql-8-index-skip-scan.md",
                "text/markdown",
                markdownWithFrontmatter.getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/v1/admin/articles/upload")
                        .file(file)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").value(greaterThan(0)));

        // 验证通过前台 Slug 接口能够立即查到刚才上传并入库的文章
        mockMvc.perform(get("/api/v1/articles/mysql-8-index-skip-scan")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.title").value("MySQL 8.0 索引跳跃扫描实战分析"))
                .andExpect(jsonPath("$.data.tags", hasItem("MySQL")))
                .andExpect(jsonPath("$.data.contentMarkdown").value(containsString("当查询条件不满足最左前缀原则时")));
    }
}


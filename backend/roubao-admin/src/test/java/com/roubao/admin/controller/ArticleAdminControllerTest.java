package com.roubao.admin.controller;

import com.roubao.admin.TestAdminApplication;
import com.roubao.article.service.ArticleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doThrow;
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
@SpringBootTest(classes = TestAdminApplication.class)
@AutoConfigureMockMvc
class ArticleAdminControllerTest {

    private static final String ADMIN_TOKEN_HEADER = "X-Admin-Token";
    private static final String VALID_ADMIN_TOKEN = "roubao-admin-secret-token";

    @Autowired
    private MockMvc mockMvc;

    @SpyBean
    private ArticleService articleService;

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

    @Test
    @DisplayName("重复 Slug 冲突防护：当上传重复 Slug 的文章触发唯一约束时应返回 409 Conflict 状态与错误码")
    void shouldReturnConflictWhenDuplicateSlugIsUploaded() throws Exception {
        // 模拟 Service 在底层抛出 DuplicateKeyException
        doThrow(new DuplicateKeyException("Duplicate entry 'duplicate-conflict-slug' for key 'uk_article_slug'"))
                .when(articleService).createArticle(argThat(dto -> dto != null && "duplicate-conflict-slug".equals(dto.slug())));

        try {
            String duplicateMarkdown = """
                    ---
                    title: "重复 Slug 冲突测试"
                    slug: "duplicate-conflict-slug"
                    category: "architecture"
                    ---
                    # 冲突正文
                    """;
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "conflict.md",
                    "text/markdown",
                    duplicateMarkdown.getBytes(StandardCharsets.UTF_8)
            );

            // 断言全局异常处理器成功拦截 DuplicateKeyException，返回 HTTP 409 及 code=409
            mockMvc.perform(multipart("/api/v1/admin/articles/upload")
                            .file(file)
                            .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value(409))
                    .andExpect(jsonPath("$.message").value(containsString("数据已存在或路由标识冲突")));
        } finally {
            Mockito.reset(articleService);
        }
    }
}

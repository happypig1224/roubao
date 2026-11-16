package com.roubao.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roubao.admin.TestAdminApplication;
import com.roubao.article.model.dto.ArticleCreateDTO;
import com.roubao.article.model.dto.ArticleUpdateDTO;
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
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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

    @Autowired
    private ObjectMapper objectMapper;

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

    @Test
    @DisplayName("管理端文章完整生命周期：创建、分页列表、按 ID 详情、更新、置顶切换、精选切换、发布上下线、删除")
    void shouldPerformArticleCrudAndLifecycleSuccessfully() throws Exception {
        // 1. 创建文章
        ArticleCreateDTO createDTO = new ArticleCreateDTO(
                1L,
                "领域驱动设计在复杂系统的落地",
                "ddd-tactical-patterns-in-action",
                "DDD 战术设计与防腐层深度实战",
                "cover/ddd.png",
                List.of("DDD", "架构", "设计模式"),
                12,
                50,
                false, // 默认草稿
                false,
                false,
                "# DDD 战术设计实战\n\n聚合根与领域事件是核心..."
        );

        String createResp = mockMvc.perform(post("/api/v1/admin/articles")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").value(greaterThan(0)))
                .andReturn().getResponse().getContentAsString();

        Number artIdNum = com.jayway.jsonpath.JsonPath.read(createResp, "$.data");
        Long articleId = artIdNum.longValue();

        // 2. 管理端分页查询 (默认查全部，包含草稿)
        mockMvc.perform(get("/api/v1/admin/articles")
                        .param("pageNo", "1")
                        .param("pageSize", "10")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.data.list[*].slug", hasItem("ddd-tactical-patterns-in-action")));

        // 3. 根据主键 ID 查询完整详情 (含正文 CLOB)
        mockMvc.perform(get("/api/v1/admin/articles/" + articleId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.title").value("领域驱动设计在复杂系统的落地"))
                .andExpect(jsonPath("$.data.published").value(false))
                .andExpect(jsonPath("$.data.contentMarkdown").value(containsString("聚合根与领域事件是核心")));

        // 4. 更新文章
        ArticleUpdateDTO updateDTO = new ArticleUpdateDTO(
                1L,
                "领域驱动设计在复杂系统的落地 (精粹版)",
                "ddd-tactical-patterns-v2",
                "更新后的导读摘要",
                "cover/ddd-v2.png",
                List.of("DDD", "Java 21"),
                15,
                80,
                false,
                false,
                false,
                "# 优化升级正文\n\n新增了防腐层 ACL 实践..."
        );

        mockMvc.perform(put("/api/v1/admin/articles/" + articleId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // 5. 校验更新后结果
        mockMvc.perform(get("/api/v1/admin/articles/" + articleId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("领域驱动设计在复杂系统的落地 (精粹版)"))
                .andExpect(jsonPath("$.data.slug").value("ddd-tactical-patterns-v2"))
                .andExpect(jsonPath("$.data.contentMarkdown").value(containsString("新增了防腐层 ACL 实践")));

        // 6. 置顶与精选切换
        mockMvc.perform(patch("/api/v1/admin/articles/" + articleId + "/top")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        mockMvc.perform(patch("/api/v1/admin/articles/" + articleId + "/featured")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // 7. 发布上线
        mockMvc.perform(patch("/api/v1/admin/articles/" + articleId + "/publish")
                        .param("published", "true")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // 8. 验证发布上线与置顶/精选状态已变更
        mockMvc.perform(get("/api/v1/admin/articles/" + articleId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.top").value(true))
                .andExpect(jsonPath("$.data.featured").value(true))
                .andExpect(jsonPath("$.data.published").value(true));

        // 9. 逻辑删除文章
        mockMvc.perform(delete("/api/v1/admin/articles/" + articleId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // 10. 再次查询应当报 404
        mockMvc.perform(get("/api/v1/admin/articles/" + articleId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1001));
    }
}

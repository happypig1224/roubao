package com.roubao.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roubao.admin.TestAdminApplication;
import com.roubao.article.model.dto.CategoryDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 后台分类管理接口测试
 *
 * @author roubao
 * @since 2026-11-16
 */
@SpringBootTest(classes = TestAdminApplication.class)
@AutoConfigureMockMvc
class CategoryAdminControllerTest {

    private static final String ADMIN_TOKEN_HEADER = "X-Admin-Token";
    private static final String VALID_ADMIN_TOKEN = "roubao-admin-secret-token";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("无 Token 访问分类管理接口应当被拦截并返回 401")
    void shouldRejectWhenTokenIsMissing() throws Exception {
        mockMvc.perform(get("/api/v1/admin/categories")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("分类完整生命周期：创建、查询列表与详情、更新、删除")
    void shouldPerformCategoryCrudSuccessfully() throws Exception {
        // 1. 创建分类
        CategoryDTO createDTO = new CategoryDTO(
                "全栈测试分类",
                "fullstack-test-cat",
                "分类详细描述说明",
                "Folder",
                100
        );

        String createResp = mockMvc.perform(post("/api/v1/admin/categories")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").value(greaterThan(0)))
                .andReturn().getResponse().getContentAsString();

        Number catIdNum = com.jayway.jsonpath.JsonPath.read(createResp, "$.data");
        Long categoryId = catIdNum.longValue();

        // 2. 查询分类列表 (验证包含新增分类及统计字段)
        mockMvc.perform(get("/api/v1/admin/categories")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.data[*].categorySlug", hasItem("fullstack-test-cat")));

        // 3. 查询单条分类详情
        mockMvc.perform(get("/api/v1/admin/categories/" + categoryId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.categoryName").value("全栈测试分类"))
                .andExpect(jsonPath("$.data.categorySlug").value("fullstack-test-cat"));

        // 4. 更新分类
        CategoryDTO updateDTO = new CategoryDTO(
                "全栈测试分类-已重命名",
                "fullstack-test-cat-updated",
                "更新后的描述说明",
                "FolderGit2",
                120
        );

        mockMvc.perform(put("/api/v1/admin/categories/" + categoryId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // 5. 校验更新后详情
        mockMvc.perform(get("/api/v1/admin/categories/" + categoryId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.categoryName").value("全栈测试分类-已重命名"))
                .andExpect(jsonPath("$.data.categorySlug").value("fullstack-test-cat-updated"));

        // 6. 删除分类
        mockMvc.perform(delete("/api/v1/admin/categories/" + categoryId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // 7. 再次查询应当报 404 (CATEGORY_NOT_FOUND code=1002)
        mockMvc.perform(get("/api/v1/admin/categories/" + categoryId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1002));
    }
}

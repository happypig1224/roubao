package com.roubao.admin.controller;

import com.roubao.admin.TestAdminApplication;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 后台仪表盘大盘概览统计接口测试
 *
 * @author roubao
 * @since 2026-11-16
 */
@SpringBootTest(classes = TestAdminApplication.class)
@AutoConfigureMockMvc
class DashboardAdminControllerTest {

    private static final String ADMIN_TOKEN_HEADER = "X-Admin-Token";
    private static final String VALID_ADMIN_TOKEN = "roubao-admin-secret-token";

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("无 Token 访问仪表盘大盘接口应当被拦截并返回 401")
    void shouldRejectWhenTokenIsMissing() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/stats")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("携带有效 Token 访问仪表盘大盘接口应当成功返回聚合统计与分类分布数据")
    void shouldReturnDashboardStatsSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/stats")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.totalArticles").value(greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.publishedArticles").value(greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.draftArticles").value(greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.totalProjects").value(greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.totalViews").value(greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.totalLikes").value(greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.data.categoryStats").isArray());
    }
}

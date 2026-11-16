package com.roubao.admin.controller;

import com.roubao.admin.TestAdminApplication;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 后台管理身份鉴权与会话探活接口测试
 *
 * @author roubao
 * @since 2026-11-16
 */
@SpringBootTest(classes = TestAdminApplication.class)
@AutoConfigureMockMvc
class AdminAuthControllerTest {

    private static final String ADMIN_TOKEN_HEADER = "X-Admin-Token";
    private static final String VALID_ADMIN_TOKEN = "roubao-admin-secret-token";

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("无 Token 访问鉴权探活接口应当被拦截并返回 401")
    void shouldRejectWhenTokenIsMissing() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auth/verify")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("携带有效 Token 访问鉴权探活接口应当返回 authenticated=true")
    void shouldPassWhenTokenIsValid() throws Exception {
        mockMvc.perform(get("/api/v1/admin/auth/verify")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.authenticated").value(true))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }
}

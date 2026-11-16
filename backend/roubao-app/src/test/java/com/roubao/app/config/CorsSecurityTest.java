package com.roubao.app.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * CORS 跨源安全隔离与凭证防泄露测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest
@AutoConfigureMockMvc
class CorsSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("白名单内的前端域名应当被正常授予 CORS 跨域响应头并允许凭证")
    void shouldAllowWhitelistedOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/articles")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("非白名单的恶意来源跨域请求应当被拒绝授予 Access-Control-Allow-Origin")
    void shouldRejectMaliciousOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/articles")
                        .header("Origin", "https://evil-attacker.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}

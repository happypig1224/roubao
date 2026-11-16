package com.roubao.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roubao.admin.TestAdminApplication;
import com.roubao.project.model.dto.ProjectCreateDTO;
import com.roubao.project.model.dto.ProjectUpdateDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 后台开源项目展厅管理接口测试
 *
 * @author roubao
 * @since 2026-11-16
 */
@SpringBootTest(classes = TestAdminApplication.class)
@AutoConfigureMockMvc
class ProjectAdminControllerTest {

    private static final String ADMIN_TOKEN_HEADER = "X-Admin-Token";
    private static final String VALID_ADMIN_TOKEN = "roubao-admin-secret-token";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("无 Token 访问项目管理接口应当被拦截并返回 401")
    void shouldRejectWhenTokenIsMissing() throws Exception {
        mockMvc.perform(get("/api/v1/admin/projects")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    @DisplayName("开源项目完整生命周期：创建、分页查询、按 ID 详情、更新、删除")
    void shouldPerformProjectCrudSuccessfully() throws Exception {
        // 1. 创建项目
        ProjectCreateDTO createDTO = new ProjectCreateDTO(
                "高性能网关中间件",
                "high-perf-gateway",
                "基于 Netty 实现的轻量高性能 API 网关",
                "支持动态路由与限流熔断",
                List.of("Netty 4.1", "Redis 分布式限流", "零拷贝"),
                List.of("Java 21", "Netty", "Redis"),
                "https://github.com/example/gateway",
                "https://demo.example.com",
                256,
                "TPS 120,000+ / P99 < 3ms",
                100,
                true
        );

        String createResp = mockMvc.perform(post("/api/v1/admin/projects")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").value(greaterThan(0)))
                .andReturn().getResponse().getContentAsString();

        Number projIdNum = com.jayway.jsonpath.JsonPath.read(createResp, "$.data");
        Long projectId = projIdNum.longValue();

        // 2. 分页查询项目列表
        mockMvc.perform(get("/api/v1/admin/projects")
                        .param("pageNo", "1")
                        .param("pageSize", "10")
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.data.list[*].slug", hasItem("high-perf-gateway")));

        // 3. 查询单条项目详情
        mockMvc.perform(get("/api/v1/admin/projects/" + projectId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.projectName").value("高性能网关中间件"))
                .andExpect(jsonPath("$.data.slug").value("high-perf-gateway"))
                .andExpect(jsonPath("$.data.featured").value(true));

        // 4. 更新项目
        ProjectUpdateDTO updateDTO = new ProjectUpdateDTO(
                "高性能网关中间件-V2",
                "high-perf-gateway-v2",
                "全面升级为虚拟线程驱动",
                "新版详细描述",
                List.of("Virtual Threads", "JUC"),
                List.of("Java 21", "Virtual Threads"),
                "https://github.com/example/gateway-v2",
                "https://demo2.example.com",
                512,
                "TPS 180,000+ / P99 < 1.5ms",
                200,
                false
        );

        mockMvc.perform(put("/api/v1/admin/projects/" + projectId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // 5. 校验更新后详情
        mockMvc.perform(get("/api/v1/admin/projects/" + projectId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.projectName").value("高性能网关中间件-V2"))
                .andExpect(jsonPath("$.data.slug").value("high-perf-gateway-v2"))
                .andExpect(jsonPath("$.data.starCount").value(512))
                .andExpect(jsonPath("$.data.featured").value(false));

        // 6. 逻辑删除项目
        mockMvc.perform(delete("/api/v1/admin/projects/" + projectId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // 7. 再次查询应当报 404
        mockMvc.perform(get("/api/v1/admin/projects/" + projectId)
                        .header(ADMIN_TOKEN_HEADER, VALID_ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(2001));
    }
}

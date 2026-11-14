package com.roubao.app.controller.portal;

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
 * 开源项目展厅前台门户 REST 接口验收测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest
@AutoConfigureMockMvc
class ProjectPortalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("分页查询开源项目列表：返回 200 且分页结构完整")
    void shouldReturnProjectPageSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/projects")
                        .param("pageNo", "1")
                        .param("pageSize", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray())
                .andExpect(jsonPath("$.data.total").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.list[0].projectName").isNotEmpty());
    }

    @Test
    @DisplayName("拉取首页精选项目列表：返回 200 且优先按 Star 数降序排列")
    void shouldReturnFeaturedProjectsSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/projects/featured")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[0].featured").value(true));
    }

    @Test
    @DisplayName("根据 Slug 查询项目详情：存在时返回 200，不存在时返回 2001(PROJECT_NOT_FOUND)")
    void shouldReturnProjectDetailBySlug() throws Exception {
        mockMvc.perform(get("/api/v1/projects/roubao-gateway")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.slug").value("roubao-gateway"))
                .andExpect(jsonPath("$.data.architectureHighlights").isArray());

        mockMvc.perform(get("/api/v1/projects/non-existing-slug-xyz")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(2001));
    }
}


package com.roubao.project.controller;

import com.roubao.project.TestProjectApplication;
import com.roubao.project.entity.ProjectDO;
import com.roubao.project.mapper.ProjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 开源项目展厅前台门户 REST 接口验收测试 (roubao-project 领域自治)
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest(classes = TestProjectApplication.class)
@AutoConfigureMockMvc
@Transactional
class ProjectPortalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectMapper projectMapper;

    @BeforeEach
    void setUp() {
        if (projectMapper.selectCount(null) < 3) {
            ProjectDO p1 = new ProjectDO();
            p1.setProjectName("Roubao Gateway");
            p1.setSlug("roubao-gateway");
            p1.setTagline("轻量级高吞吐 API 网关");
            p1.setDescription("基于 Java 21 虚拟线程与 Netty 开发。支持动态路由、令牌桶限流与全链路 TraceId 透传。");
            p1.setArchitectureHighlights(List.of("虚拟线程调度替代传统异步回调", "Redis 7 + Lua 脚本实现毫秒级原子限流"));
            p1.setTechTags(List.of("Java 21", "Spring Boot 3", "Netty", "Redis"));
            p1.setRepoUrl("https://github.com/example/roubao-gateway");
            p1.setStarCount(1280);
            p1.setMetricsSummary("38K QPS / P99 4.2ms");
            p1.setSortOrder(100);
            p1.setFeatured(true);
            projectMapper.insert(p1);

            ProjectDO p2 = new ProjectDO();
            p2.setProjectName("Tactile UI");
            p2.setSlug("tactile-ui");
            p2.setTagline("面向极客体验的温润组件库");
            p2.setDescription("专为桌面端与移动端双向自适应定制的 React 组件库。");
            p2.setArchitectureHighlights(List.of("基于 CSS 变量的主题无感切换", "深度优化微交互：按压微震与同心超椭圆"));
            p2.setTechTags(List.of("React 19", "Next.js", "Tailwind v4"));
            p2.setRepoUrl("https://github.com/example/tactile-ui");
            p2.setStarCount(960);
            p2.setMetricsSummary("60fps 硬件加速动效");
            p2.setSortOrder(90);
            p2.setFeatured(true);
            projectMapper.insert(p2);

            ProjectDO p3 = new ProjectDO();
            p3.setProjectName("CloudTrace Hub");
            p3.setSlug("cloud-trace");
            p3.setTagline("分布式全链路追踪看板");
            p3.setDescription("为中小型全栈系统量身打造的可观测工具。");
            p3.setArchitectureHighlights(List.of("自研轻量级 Agent", "ClickHouse 高压缩比列式存储"));
            p3.setTechTags(List.of("Java 21", "ClickHouse", "Next.js"));
            p3.setRepoUrl("https://github.com/example/cloud-trace");
            p3.setStarCount(820);
            p3.setMetricsSummary("日均 500 万 Trace 采集");
            p3.setSortOrder(80);
            p3.setFeatured(true);
            projectMapper.insert(p3);
        }
    }

    @Test
    @DisplayName("分页查询项目列表：返回 200 且数据符合 PageResult 契约")
    void shouldReturnProjectPageSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/projects")
                        .param("pageNo", "1")
                        .param("pageSize", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray())
                .andExpect(jsonPath("$.data.total").value(greaterThanOrEqualTo(3)))
                .andExpect(jsonPath("$.data.list[0].projectName").isNotEmpty())
                .andExpect(jsonPath("$.data.list[0].slug").isNotEmpty());
    }

    @Test
    @DisplayName("拉取精选推荐项目：返回 200 且包含精选开源项目")
    void shouldReturnFeaturedProjectsSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/projects/featured")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$.data[0].projectName").isNotEmpty());
    }

    @Test
    @DisplayName("根据 Slug 查询详情：返回 200 且包含架构亮点与技术标签")
    void shouldReturnProjectDetailBySlug() throws Exception {
        mockMvc.perform(get("/api/v1/projects/roubao-gateway")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.slug").value("roubao-gateway"))
                .andExpect(jsonPath("$.data.projectName").value("Roubao Gateway"))
                .andExpect(jsonPath("$.data.architectureHighlights").isArray())
                .andExpect(jsonPath("$.data.architectureHighlights", hasItem(containsString("虚拟线程"))))
                .andExpect(jsonPath("$.data.techTags").isArray())
                .andExpect(jsonPath("$.data.techTags", hasItem("Java 21")));
    }
}

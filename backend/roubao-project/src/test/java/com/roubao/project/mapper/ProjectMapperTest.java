package com.roubao.project.mapper;

import com.roubao.project.entity.ProjectDO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 开源项目展厅持久层单元测试
 * 核心验证：JSON 格式亮点与技术栈往返一致、findBySlug 与软删除逻辑
 *
 * @author roubao
 * @since 2026-11-13
 */
@SpringBootTest
@Transactional
class ProjectMapperTest {

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("应该正确持久化项目展厅实体并保持 JSON 列表与软删除生效")
    void shouldPersistProjectWithJsonListsAndSoftDelete() {
        // Arrange
        ProjectDO project = new ProjectDO();
        project.setProjectName("Roubao Gateway");
        project.setSlug("roubao-gateway");
        project.setTagline("轻量级高吞吐 API 网关");
        project.setDescription("基于 Java 21 虚拟线程与 Netty 开发");
        project.setArchitectureHighlights(List.of(
                "虚拟线程调度替代传统异步回调",
                "Redis 7 + Lua 脚本实现毫秒级原子限流",
                "集成 OpenTelemetry 标准链路头"
        ));
        project.setTechTags(List.of("Java 21", "Spring Boot 3", "Netty", "Redis"));
        project.setRepoUrl("https://github.com/example/roubao-gateway");
        project.setDemoUrl("https://gateway.roubao.dev");
        project.setStarCount(128);
        project.setMetricsSummary("38K QPS / P99 4.2ms");
        project.setSortOrder(100);
        project.setFeatured(true);
        project.setDeleted(false);

        // Act - 插入
        int rows = projectMapper.insert(project);
        assertThat(rows).isEqualTo(1);
        assertThat(project.getId()).isNotNull();

        // Assert - 通过 Slug 查询
        Optional<ProjectDO> queriedOpt = projectMapper.findBySlug("roubao-gateway");
        assertThat(queriedOpt).isPresent();

        ProjectDO queried = queriedOpt.get();
        assertThat(queried.getProjectName()).isEqualTo("Roubao Gateway");
        assertThat(queried.getFeatured()).isTrue();
        assertThat(queried.getArchitectureHighlights())
                .isNotNull()
                .hasSize(3)
                .contains("虚拟线程调度替代传统异步回调");
        assertThat(queried.getTechTags())
                .isNotNull()
                .hasSize(4)
                .contains("Java 21", "Netty");

        // Act - 软删除
        int deleteRows = projectMapper.deleteById(project.getId());
        assertThat(deleteRows).isEqualTo(1);

        // Assert - 框架查询结果应为空
        ProjectDO afterDelete = projectMapper.selectById(project.getId());
        assertThat(afterDelete).isNull();

        // Assert - 底层物理行核验证实 is_deleted = 1
        Integer rawDeleted = jdbcTemplate.queryForObject(
                "SELECT is_deleted FROM tb_project WHERE id = ?",
                Integer.class,
                project.getId()
        );
        assertThat(rawDeleted).isEqualTo(1);
    }
}

package com.roubao.project.model.vo;

import com.roubao.project.entity.ProjectDO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 开源项目展厅模型 VO 转换与防腐隔离单元测试
 *
 * @author roubao
 * @since 2026-11-14
 */
class ProjectVoMappingTest {

    @Test
    @DisplayName("ProjectVO - 物理反射检查：严禁泄露底层逻辑删除等内部数据库字段")
    void shouldEnsureProjectVoExcludesInternalDatabaseFields() {
        Field[] declaredFields = ProjectVO.class.getDeclaredFields();
        List<String> fieldNames = Arrays.stream(declaredFields)
                .map(Field::getName)
                .toList();

        assertThat(fieldNames)
                .doesNotContain("isDeleted", "deleted", "gmtModified");
    }

    @Test
    @DisplayName("ProjectVO - 静态转换防腐：防御性深拷贝与集合不可变性保障")
    void shouldPerformDefensiveCopyAndDefaultingOnProjectVo() {
        ProjectDO project = new ProjectDO();
        project.setId(5001L);
        project.setProjectName("Roubao Blog System");
        project.setSlug("roubao-blog");
        project.setTagline("全栈现代化博客与展厅系统");
        project.setDescription("基于 Java 21 与 Next.js 打造。");
        List<String> mutableHighlights = new ArrayList<>(List.of("多模块单体架构", "虚拟线程并发"));
        List<String> mutableTechTags = new ArrayList<>(List.of("Java 21", "Spring Boot", "React 19"));
        project.setArchitectureHighlights(mutableHighlights);
        project.setTechTags(mutableTechTags);
        project.setRepoUrl("https://github.com/roubao/roubao");
        project.setDemoUrl("https://roubao.com");
        project.setStarCount(89);
        project.setMetricsSummary("P99 3.5ms");
        project.setSortOrder(100);
        project.setFeatured(true);
        project.setGmtCreate(LocalDateTime.now());

        ProjectVO vo = ProjectVO.from(project);

        assertThat(vo).isNotNull();
        assertThat(vo.id()).isEqualTo(5001L);
        assertThat(vo.projectName()).isEqualTo("Roubao Blog System");
        assertThat(vo.featured()).isTrue();
        assertThat(vo.architectureHighlights()).containsExactly("多模块单体架构", "虚拟线程并发");
        assertThat(vo.techTags()).containsExactly("Java 21", "Spring Boot", "React 19");

        // 验证防腐：修改源 DO 集合，VO 内部集合不受影响
        mutableHighlights.add("PollutedHighlight");
        mutableTechTags.add("PollutedTag");
        assertThat(vo.architectureHighlights()).doesNotContain("PollutedHighlight");
        assertThat(vo.techTags()).doesNotContain("PollutedTag");

        // 验证不可变性：直接尝试修改 VO 的集合抛出 UnsupportedOperationException
        List<String> voHighlights = vo.architectureHighlights();
        assertThatThrownBy(() -> voHighlights.add("Illegal"))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("ProjectVO - 空实体安全处理与数值字段默认保底")
    void shouldHandleNullProjectSafely() {
        assertThat(ProjectVO.from(null)).isNull();

        ProjectDO emptyProject = new ProjectDO();
        emptyProject.setId(5002L);
        emptyProject.setProjectName("Bare Project");
        emptyProject.setSlug("bare-project");
        emptyProject.setStarCount(null);
        emptyProject.setSortOrder(null);
        emptyProject.setFeatured(null);

        ProjectVO vo = ProjectVO.from(emptyProject);

        assertThat(vo).isNotNull();
        assertThat(vo.starCount()).isEqualTo(0);
        assertThat(vo.sortOrder()).isEqualTo(0);
        assertThat(vo.featured()).isFalse();
        assertThat(vo.architectureHighlights()).isEmpty();
        assertThat(vo.techTags()).isEmpty();
    }
}

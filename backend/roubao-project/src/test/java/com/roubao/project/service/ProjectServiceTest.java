package com.roubao.project.service;

import com.roubao.framework.common.PageResult;
import com.roubao.framework.constant.CacheConstants;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import com.roubao.framework.redis.RedisCache;
import com.roubao.framework.redis.RedisUtils;
import com.roubao.project.TestProjectApplication;
import com.roubao.project.entity.ProjectDO;
import com.roubao.project.mapper.ProjectMapper;
import com.roubao.project.model.dto.ProjectQueryDTO;
import com.roubao.project.model.vo.ProjectVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 开源项目展厅服务验收测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest(classes = TestProjectApplication.class)
@Transactional
class ProjectServiceTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private RedisCache redisCache;

    @BeforeEach
    void cleanCache() {
        RedisUtils.deleteObject(CacheConstants.PROJECT_FEATURED);
    }

    @Test
    @DisplayName("精选项目列表拉取：仅返回 isFeatured=true 记录且按 Star 数降序排列")
    void shouldListFeaturedProjectsOrderedByStarCountDesc() {
        ProjectDO p1 = createProjectDo("普通工具项目", "normal-tool", false, 50, 1);
        projectService.createProject(p1);

        ProjectDO p2 = createProjectDo("精选网关项目", "gateway-featured", true, 800, 10);
        projectService.createProject(p2);

        ProjectDO p3 = createProjectDo("精选高星微服务框架", "microservice-featured", true, 2500, 5);
        projectService.createProject(p3);

        List<ProjectVO> featuredProjects = projectService.listFeaturedProjects();

        assertThat(featuredProjects).hasSize(2);
        // 断言 Star 排序：2500 star 的 p3 必须排在 800 star 的 p2 前面
        assertThat(featuredProjects.get(0).slug()).isEqualTo("microservice-featured");
        assertThat(featuredProjects.get(1).slug()).isEqualTo("gateway-featured");
        // 断言普通项目未被纳入精选
        assertThat(featuredProjects.stream().map(ProjectVO::slug))
                .doesNotContain("normal-tool");
    }

    @Test
    @DisplayName("分页查询展厅项目：支持关键字检索与分页限制")
    void shouldPageProjectsWithKeywordSearch() {
        ProjectDO p1 = createProjectDo("Roubao Cache", "roubao-cache", true, 300, 1);
        projectService.createProject(p1);

        ProjectDO p2 = createProjectDo("Roubao Message", "roubao-message", false, 150, 2);
        projectService.createProject(p2);

        ProjectQueryDTO query = new ProjectQueryDTO();
        query.setKeyword("Cache");
        query.setPageNo(1L);
        query.setPageSize(10L);

        PageResult<ProjectVO> pageResult = projectService.pageProjects(query);

        assertThat(pageResult.getTotal()).isEqualTo(1);
        assertThat(pageResult.getList().get(0).slug()).isEqualTo("roubao-cache");
    }

    @Test
    @DisplayName("根据 Slug 查询详情：正常命中与不存在时抛出 PROJECT_NOT_FOUND 异常")
    void shouldGetProjectBySlugOrThrowWhenNotFound() {
        ProjectDO p = createProjectDo("独家开源展示", "unique-showcase", true, 666, 1);
        projectService.createProject(p);

        ProjectVO vo = projectService.getProjectBySlug("unique-showcase");
        assertThat(vo).isNotNull();
        assertThat(vo.projectName()).isEqualTo("独家开源展示");

        assertThatThrownBy(() -> projectService.getProjectBySlug("non-existent-project"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.PROJECT_NOT_FOUND));
    }

    @Test
    @DisplayName("精选项目缓存集成：首次查库回填 Redis，新增项目时主动失效缓存")
    void shouldCacheFeaturedProjectsAndInvalidateOnCreate() {
        ProjectDO p = createProjectDo("精选响应式组件", "reactive-comp", true, 999, 1);
        projectService.createProject(p);

        // 首次读取：触发回填
        List<ProjectVO> list1 = projectService.listFeaturedProjects();
        assertThat(list1).isNotEmpty();
        assertThat(RedisUtils.hasKey(CacheConstants.PROJECT_FEATURED)).isTrue();

        // 再次新增精选项目：应主动触发缓存失效
        ProjectDO p2 = createProjectDo("精选网关微核心", "gateway-micro", true, 1999, 2);
        projectService.createProject(p2);
        assertThat(RedisUtils.hasKey(CacheConstants.PROJECT_FEATURED)).isFalse();

        // 重新读取：重新回填最新数据
        List<ProjectVO> list2 = projectService.listFeaturedProjects();
        assertThat(list2).hasSize(2);
        assertThat(RedisUtils.hasKey(CacheConstants.PROJECT_FEATURED)).isTrue();
    }

    private ProjectDO createProjectDo(String name, String slug, boolean featured, int stars, int sortOrder) {
        ProjectDO project = new ProjectDO();
        project.setProjectName(name);
        project.setSlug(slug);
        project.setTagline("标语-" + name);
        project.setDescription("描述信息-" + name);
        project.setArchitectureHighlights(List.of("亮点1", "亮点2"));
        project.setTechTags(List.of("Java", "Spring"));
        project.setRepoUrl("https://github.com/roubao/" + slug);
        project.setDemoUrl("https://demo.roubao.com/" + slug);
        project.setStarCount(stars);
        project.setMetricsSummary("QPS 10K");
        project.setSortOrder(sortOrder);
        project.setFeatured(featured);
        return project;
    }
}


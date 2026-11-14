package com.roubao.article.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.roubao.article.TestArticleApplication;
import com.roubao.article.entity.ArticleContentDO;
import com.roubao.article.entity.ArticleDO;
import com.roubao.article.entity.ArticleStatsDO;
import com.roubao.article.entity.CategoryDO;
import com.roubao.article.mapper.ArticleContentMapper;
import com.roubao.article.mapper.ArticleMapper;
import com.roubao.article.mapper.ArticleStatsMapper;
import com.roubao.article.mapper.CategoryMapper;
import com.roubao.article.model.dto.ArticleQueryDTO;
import com.roubao.article.model.vo.ArticleDetailVO;
import com.roubao.article.model.vo.ArticleListVO;
import com.roubao.framework.common.PageResult;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

/**
 * 文章业务领域服务验收测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest(classes = TestArticleApplication.class)
class ArticleServiceTest {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private ArticleStatsMapper articleStatsMapper;

    @SpyBean
    private ArticleContentMapper articleContentMapper;

    private Long backendCategoryId;
    private Long devopsCategoryId;

    @BeforeEach
    void setUpTestData() {
        // 重置 Spy 与清理残留数据，保障用例独立性
        Mockito.reset(articleContentMapper);
        articleContentMapper.delete(null);
        articleStatsMapper.delete(null);
        articleMapper.delete(null);
        categoryMapper.delete(null);

        // 初始化分类
        CategoryDO cat1 = new CategoryDO();
        cat1.setCategoryName("后端技术");
        cat1.setCategorySlug("backend");
        cat1.setSortOrder(10);
        categoryMapper.insert(cat1);
        backendCategoryId = cat1.getId();

        CategoryDO cat2 = new CategoryDO();
        cat2.setCategoryName("DevOps运维");
        cat2.setCategorySlug("devops");
        cat2.setSortOrder(5);
        categoryMapper.insert(cat2);
        devopsCategoryId = cat2.getId();
    }

    @Test
    @DisplayName("多条件分页检索：验证分类/标签筛选与排序 (权重降序 + 发布时间降序)")
    void shouldPageArticlesWithFiltersAndSorting() {
        // 准备 3 篇文章
        ArticleDO a1 = createArticleDo(backendCategoryId, "Spring Boot 核心原理解析", "spring-boot-core",
                List.of("Java", "Spring"), 10, LocalDateTime.of(2026, 11, 10, 10, 0));
        articleService.createArticle(a1, "# 正文 1");

        ArticleDO a2 = createArticleDo(backendCategoryId, "JVM 虚拟线程高并发实战", "jvm-virtual-threads",
                List.of("Java", "JVM"), 20, LocalDateTime.of(2026, 11, 12, 10, 0));
        articleService.createArticle(a2, "# 正文 2");

        ArticleDO a3 = createArticleDo(devopsCategoryId, "Kubernetes 集群搭建与运维", "k8s-cluster-setup",
                List.of("K8s", "DevOps"), 5, LocalDateTime.of(2026, 11, 14, 10, 0));
        articleService.createArticle(a3, "# 正文 3");

        // 1. 分类筛选: 查 backendCategoryId
        ArticleQueryDTO queryByCat = new ArticleQueryDTO();
        queryByCat.setCategoryId(backendCategoryId);
        PageResult<ArticleListVO> pageResult1 = articleService.pageArticles(queryByCat);

        assertThat(pageResult1.getTotal()).isEqualTo(2);
        assertThat(pageResult1.getList()).hasSize(2);
        // 验证排序：权重 20 的 a2 排在前面，权重 10 的 a1 排在后面
        assertThat(pageResult1.getList().get(0).slug()).isEqualTo("jvm-virtual-threads");
        assertThat(pageResult1.getList().get(1).slug()).isEqualTo("spring-boot-core");

        // 2. 标签筛选: 查 "JVM"
        ArticleQueryDTO queryByTag = new ArticleQueryDTO();
        queryByTag.setTag("JVM");
        PageResult<ArticleListVO> pageResult2 = articleService.pageArticles(queryByTag);

        assertThat(pageResult2.getTotal()).isEqualTo(1);
        assertThat(pageResult2.getList().get(0).title()).isEqualTo("JVM 虚拟线程高并发实战");

        // 3. 关键字模糊搜索: 查 "Kubernetes"
        ArticleQueryDTO queryByKeyword = new ArticleQueryDTO();
        queryByKeyword.setKeyword("Kubernetes");
        PageResult<ArticleListVO> pageResult3 = articleService.pageArticles(queryByKeyword);

        assertThat(pageResult3.getTotal()).isEqualTo(1);
        assertThat(pageResult3.getList().get(0).slug()).isEqualTo("k8s-cluster-setup");
    }

    @Test
    @DisplayName("根据 Slug 查询详情：聚合文章主体、正文 Markdown 与热点统计")
    void shouldAssembleArticleDetailBySlugSuccessfully() {
        ArticleDO article = createArticleDo(backendCategoryId, "Java 21 最佳实践", "java-21-best-practices",
                List.of("Java", "Java21"), 15, LocalDateTime.now());
        Long articleId = articleService.createArticle(article, "# 深入理解 Java 21\n\n正文内容测试...");

        // 更新统计量验证聚合
        ArticleStatsDO stats = articleStatsMapper.selectOne(
                new LambdaQueryWrapper<ArticleStatsDO>().eq(ArticleStatsDO::getArticleId, articleId)
        );
        stats.setViewCount(1024L);
        stats.setLikeCount(99L);
        articleStatsMapper.updateById(stats);

        ArticleDetailVO detailVO = articleService.getArticleDetailBySlug("java-21-best-practices");

        assertThat(detailVO).isNotNull();
        assertThat(detailVO.id()).isEqualTo(articleId);
        assertThat(detailVO.title()).isEqualTo("Java 21 最佳实践");
        assertThat(detailVO.categoryName()).isEqualTo("后端技术");
        assertThat(detailVO.contentMarkdown()).isEqualTo("# 深入理解 Java 21\n\n正文内容测试...");
        assertThat(detailVO.tags()).containsExactly("Java", "Java21");
        assertThat(detailVO.viewCount()).isEqualTo(1024L);
        assertThat(detailVO.likeCount()).isEqualTo(99L);
    }

    @Test
    @DisplayName("Slug 不存在时应抛出明确的 BusinessException(ARTICLE_NOT_FOUND)")
    void shouldThrowBusinessExceptionWhenSlugDoesNotExist() {
        assertThatThrownBy(() -> articleService.getArticleDetailBySlug("non-existent-slug"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getErrorCode()).isEqualTo(ErrorCode.ARTICLE_NOT_FOUND);
                });
    }

    @Test
    @DisplayName("短事务回滚断言：正文写入失败时，tb_article 与 tb_article_content 双表必须彻底回滚")
    void shouldRollbackTransactionWhenContentFailsToSave() {
        // 模拟正文写入时触发异常
        doThrow(new RuntimeException("Simulated Database IO Failure"))
                .when(articleContentMapper).insert(any(ArticleContentDO.class));

        ArticleDO article = createArticleDo(backendCategoryId, "事务回滚测试文章", "transaction-rollback-test",
                List.of("Test"), 1, LocalDateTime.now());

        assertThatThrownBy(() -> articleService.createArticle(article, "# 尝试写入的正文"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Simulated Database IO Failure");

        // 断言 tb_article 中无此记录（彻底回滚，不在库中残留脏数据）
        assertThat(articleMapper.findBySlug("transaction-rollback-test")).isEmpty();
    }

    @Test
    @DisplayName("累加文章阅读量：有效 Slug 累加阅读数，不存在的 Slug 抛出 NOT_FOUND")
    void shouldIncrementViewsForValidSlug() {
        ArticleDO article = createArticleDo(backendCategoryId, "阅读量累加测试", "increment-view-test",
                List.of("View"), 1, LocalDateTime.now());
        articleService.createArticle(article, "# 阅读量测试正文");

        articleService.incrementViews("increment-view-test");
        articleService.incrementViews("increment-view-test");

        ArticleStatsDO stats = articleStatsMapper.findByArticleId(article.getId()).orElseThrow();
        assertThat(stats.getViewCount()).isEqualTo(2L);

        assertThatThrownBy(() -> articleService.incrementViews("non-existing-slug"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode()).isEqualTo(ErrorCode.ARTICLE_NOT_FOUND));
    }

    private ArticleDO createArticleDo(Long categoryId, String title, String slug,
                                     List<String> tags, Integer sortOrder, LocalDateTime publishedAt) {
        ArticleDO article = new ArticleDO();
        article.setCategoryId(categoryId);
        article.setTitle(title);
        article.setSlug(slug);
        article.setSummary("文章测试摘要");
        article.setCoverImageKey("covers/test.webp");
        article.setFileType("md");
        article.setTags(tags);
        article.setReadTimeMinutes(5);
        article.setSortOrder(sortOrder);
        article.setPublished(true);
        article.setTop(false);
        article.setFeatured(false);
        article.setPublishedAt(publishedAt);
        return article;
    }
}


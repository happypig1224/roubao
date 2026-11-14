package com.roubao.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
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
import com.roubao.article.service.ArticleService;
import com.roubao.framework.common.PageResult;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * 文章业务领域服务实现
 *
 * @author roubao
 * @since 2026-11-14
 */
@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleMapper articleMapper;
    private final ArticleContentMapper articleContentMapper;
    private final ArticleStatsMapper articleStatsMapper;
    private final CategoryMapper categoryMapper;
    private java.util.concurrent.Executor virtualThreadExecutor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor();

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private javax.sql.DataSource dataSource;

    private volatile Boolean isMySql = null;

    private boolean isMySql() {
        if (isMySql == null) {
            if (dataSource == null) {
                isMySql = true;
            } else {
                try (java.sql.Connection conn = dataSource.getConnection()) {
                    String name = conn.getMetaData().getDatabaseProductName();
                    isMySql = name != null && name.toLowerCase().contains("mysql");
                } catch (Exception e) {
                    isMySql = true;
                }
            }
        }
        return isMySql;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setVirtualThreadExecutor(@org.springframework.beans.factory.annotation.Qualifier("virtualThreadExecutor") java.util.concurrent.Executor virtualThreadExecutor) {
        if (virtualThreadExecutor != null) {
            this.virtualThreadExecutor = virtualThreadExecutor;
        }
    }

    public PageResult<ArticleListVO> pageArticles(ArticleQueryDTO query) {
        long current = (query != null && query.getPageNo() != null) ? query.getPageNo() : 1L;
        long size = (query != null && query.getPageSize() != null) ? query.getPageSize() : 10L;

        Page<ArticleDO> page = new Page<>(current, size);
        LambdaQueryWrapper<ArticleDO> wrapper = new LambdaQueryWrapper<>();

        if (query != null) {
            // 1. 分类筛选
            if (query.getCategoryId() != null) {
                wrapper.eq(ArticleDO::getCategoryId, query.getCategoryId());
            }
            // 2. 标签匹配 (生产 MySQL 8 原生 JSON_CONTAINS 规范函数，支持多值索引下推加速；测试环境自适应降级)
            if (StringUtils.hasText(query.getTag())) {
                String tagVal = query.getTag().trim();
                if (isMySql()) {
                    wrapper.apply("JSON_CONTAINS(tags, JSON_QUOTE({0}))", tagVal);
                } else {
                    wrapper.like(ArticleDO::getTags, "\"" + tagVal + "\"");
                }
            }
            // 3. 关键字模糊搜索 (标题或导读摘要)
            if (StringUtils.hasText(query.getKeyword())) {
                String kw = query.getKeyword().trim();
                wrapper.and(w -> w.like(ArticleDO::getTitle, kw).or().like(ArticleDO::getSummary, kw));
            }
            // 4. 发布状态筛选
            if (Boolean.TRUE.equals(query.getPublishedOnly())) {
                wrapper.eq(ArticleDO::getPublished, true);
            }
        }

        // 5. 排序规则：权重降序 + 正式发布时间降序
        wrapper.orderByDesc(ArticleDO::getSortOrder).orderByDesc(ArticleDO::getPublishedAt);

        Page<ArticleDO> resultPage = articleMapper.selectPage(page, wrapper);
        List<ArticleDO> records = resultPage.getRecords();
        if (records.isEmpty()) {
            return new PageResult<>(Collections.emptyList(), resultPage.getTotal(), current, size);
        }

        // 6. 批量拉取分类与统计指标 (单表独立操作，避免跨表 JOIN)
        Set<Long> categoryIds = records.stream()
                .map(ArticleDO::getCategoryId)
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toSet());

        Map<Long, String> categoryNameMap = categoryIds.isEmpty()
                ? Collections.emptyMap()
                : categoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(CategoryDO::getId, CategoryDO::getCategoryName, (k1, k2) -> k1));

        Set<Long> articleIds = records.stream()
                .map(ArticleDO::getId)
                .collect(Collectors.toSet());

        Map<Long, ArticleStatsDO> statsMap = articleStatsMapper.selectList(
                new LambdaQueryWrapper<ArticleStatsDO>().in(ArticleStatsDO::getArticleId, articleIds)
        ).stream().collect(Collectors.toMap(ArticleStatsDO::getArticleId, s -> s, (s1, s2) -> s1));

        List<ArticleListVO> voList = records.stream().map(article -> {
            String categoryName = categoryNameMap.getOrDefault(article.getCategoryId(), "");
            ArticleStatsDO stats = statsMap.get(article.getId());
            Long viewCount = stats != null ? stats.getViewCount() : 0L;
            Long likeCount = stats != null ? stats.getLikeCount() : 0L;
            return ArticleListVO.from(article, categoryName, viewCount, likeCount);
        }).toList();

        return new PageResult<>(voList, resultPage.getTotal(), current, size);
    }

    public ArticleDetailVO getArticleDetailBySlug(String slug) {
        // 1. 查询文章主体元数据
        ArticleDO article = articleMapper.findBySlug(slug)
                .orElseThrow(() -> new BusinessException(ErrorCode.ARTICLE_NOT_FOUND));

        // 2. 组合单表异步并行查询，装配大字段正文、分类名与统计数据 (Java 21 虚拟线程原生调度)
        CompletableFuture<ArticleContentDO> contentFuture = CompletableFuture.supplyAsync(() ->
                articleContentMapper.selectOne(
                        new LambdaQueryWrapper<ArticleContentDO>()
                                .eq(ArticleContentDO::getArticleId, article.getId())
                ), virtualThreadExecutor
        );

        CompletableFuture<CategoryDO> categoryFuture = CompletableFuture.supplyAsync(() ->
                (article.getCategoryId() != null && article.getCategoryId() > 0)
                        ? categoryMapper.selectById(article.getCategoryId())
                        : null, virtualThreadExecutor
        );

        CompletableFuture<ArticleStatsDO> statsFuture = CompletableFuture.supplyAsync(() ->
                articleStatsMapper.selectOne(
                        new LambdaQueryWrapper<ArticleStatsDO>()
                                .eq(ArticleStatsDO::getArticleId, article.getId())
                ), virtualThreadExecutor
        );

        CompletableFuture.allOf(contentFuture, categoryFuture, statsFuture).join();

        ArticleContentDO contentDO = contentFuture.join();
        CategoryDO categoryDO = categoryFuture.join();
        ArticleStatsDO statsDO = statsFuture.join();

        String markdown = contentDO != null ? contentDO.getContentMarkdown() : "";
        String categoryName = categoryDO != null ? categoryDO.getCategoryName() : "";
        Long viewCount = statsDO != null ? statsDO.getViewCount() : 0L;
        Long likeCount = statsDO != null ? statsDO.getLikeCount() : 0L;

        return ArticleDetailVO.from(article, markdown, categoryName, viewCount, likeCount);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createArticle(ArticleDO article, String contentMarkdown) {
        if (!StringUtils.hasText(contentMarkdown)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章正文内容不能为空");
        }

        // 1. 写入文章元数据表
        articleMapper.insert(article);

        // 2. 写入文章大字段正文表
        ArticleContentDO contentDO = new ArticleContentDO();
        contentDO.setArticleId(article.getId());
        contentDO.setContentMarkdown(contentMarkdown);
        articleContentMapper.insert(contentDO);

        // 3. 初始化热点计数指标表
        ArticleStatsDO statsDO = new ArticleStatsDO();
        statsDO.setArticleId(article.getId());
        statsDO.setViewCount(0L);
        statsDO.setLikeCount(0L);
        statsDO.setShareCount(0L);
        statsDO.setCommentCount(0L);
        articleStatsMapper.insert(statsDO);

        return article.getId();
    }

    public void incrementViews(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章标识不能为空");
        }
        ArticleDO article = articleMapper.findBySlug(slug.trim())
                .orElseThrow(() -> new BusinessException(ErrorCode.ARTICLE_NOT_FOUND, "文章不存在或已下架"));
        articleStatsMapper.incrementViewCount(article.getId(), 1L);
    }
}

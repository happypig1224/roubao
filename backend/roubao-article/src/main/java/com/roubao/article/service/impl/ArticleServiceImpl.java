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
import com.roubao.article.model.dto.ArticleStaticDTO;
import com.roubao.article.model.vo.ArticleDetailVO;
import com.roubao.article.model.vo.ArticleListVO;
import com.roubao.article.service.ArticleService;
import com.roubao.framework.common.PageResult;
import com.roubao.framework.constant.CacheConstants;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import com.roubao.framework.redis.RedisUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
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

    @Override
    public PageResult<ArticleListVO> pageArticles(ArticleQueryDTO query) {
        long current = (query != null && query.getPageNo() != null) ? query.getPageNo() : 1L;
        long size = (query != null && query.getPageSize() != null) ? query.getPageSize() : 10L;

        // 仅对无筛选条件的默认第 1 页启用缓存加速 (读写比 > 500:1)
        boolean isDefaultFirstPage = (query == null) || (
                query.getCategoryId() == null &&
                !StringUtils.hasText(query.getTag()) &&
                !StringUtils.hasText(query.getKeyword()) &&
                (query.getPageNo() == null || query.getPageNo() == 1L) &&
                (query.getPageSize() == null || query.getPageSize() == 10L)
        );

        if (isDefaultFirstPage) {
            PageResult<ArticleListVO> cachedPage = RedisUtils.getCacheObject(CacheConstants.ARTICLE_PAGE_DEFAULT);
            if (cachedPage != null) {
                return cachedPage;
            }
        }

        Page<ArticleDO> page = new Page<>(current, size);
        LambdaQueryWrapper<ArticleDO> wrapper = new LambdaQueryWrapper<>();

        if (query != null) {
            // 1. 分类筛选
            if (query.getCategoryId() != null) {
                wrapper.eq(ArticleDO::getCategoryId, query.getCategoryId());
            }
            // 2. 标签匹配 (生产 MySQL 8 原生 JSON_CONTAINS 规范函数，多值索引下推加速)
            if (StringUtils.hasText(query.getTag())) {
                String tagVal = query.getTag().trim();
                wrapper.apply("JSON_CONTAINS(tags, JSON_QUOTE({0}))", tagVal);
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

        PageResult<ArticleListVO> pageResult = new PageResult<>(voList, resultPage.getTotal(), current, size);
        if (isDefaultFirstPage && !voList.isEmpty()) {
            RedisUtils.setCacheObjectWithJitter(
                    CacheConstants.ARTICLE_PAGE_DEFAULT,
                    pageResult,
                    CacheConstants.ARTICLE_PAGE_DEFAULT_TTL.toSeconds(),
                    TimeUnit.SECONDS
            );
        }

        return pageResult;
    }

    @Override
    public ArticleDetailVO getArticleDetailBySlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章标识不能为空");
        }
        String trimmedSlug = slug.trim();
        String cacheKey = CacheConstants.ARTICLE_STATIC_PREFIX + trimmedSlug;

        // 1. 尝试从 Redis 提取静态大对象 (Markdown 大正文 + 静态元数据，动静解耦)
        ArticleStaticDTO staticDto = RedisUtils.getCacheObject(cacheKey);

        if (staticDto != null && staticDto.isEmpty()) {
            // 命中防穿透空对象标记 (Null-Cache)
            throw new BusinessException(ErrorCode.ARTICLE_NOT_FOUND);
        }

        if (staticDto == null) {
            // 2. 缓存未命中，回源 DB 查文章元数据
            ArticleDO article = articleMapper.findBySlug(trimmedSlug).orElse(null);
            if (article == null) {
                // 防穿透保护：回填空对象，短期 TTL 60 秒
                RedisUtils.setCacheObject(
                        cacheKey,
                        ArticleStaticDTO.EMPTY,
                        CacheConstants.NULL_CACHE_TTL.toSeconds(),
                        TimeUnit.SECONDS
                );
                throw new BusinessException(ErrorCode.ARTICLE_NOT_FOUND);
            }

            // 串行单连接查正文与分类，消除连接池雪崩风险
            ArticleContentDO contentDO = articleContentMapper.selectOne(
                    new LambdaQueryWrapper<ArticleContentDO>()
                            .eq(ArticleContentDO::getArticleId, article.getId())
            );
            CategoryDO categoryDO = (article.getCategoryId() != null && article.getCategoryId() > 0)
                    ? categoryMapper.selectById(article.getCategoryId())
                    : null;

            String markdown = contentDO != null ? contentDO.getContentMarkdown() : "";
            String categoryName = categoryDO != null ? categoryDO.getCategoryName() : "";

            staticDto = ArticleStaticDTO.from(article, markdown, categoryName);
            // 回填 Redis 缓存，带随机扰动 TTL
            RedisUtils.setCacheObjectWithJitter(
                    cacheKey,
                    staticDto,
                    CacheConstants.ARTICLE_STATIC_TTL.toSeconds(),
                    TimeUnit.SECONDS
            );
        }

        // 3. 动态指标独立查轻量统计表（毫秒级，解耦大正文，阅读量自增不冲刷大正文缓存）
        ArticleStatsDO statsDO = articleStatsMapper.selectOne(
                new LambdaQueryWrapper<ArticleStatsDO>()
                        .eq(ArticleStatsDO::getArticleId, staticDto.id())
        );

        Long viewCount = statsDO != null ? statsDO.getViewCount() : 0L;
        Long likeCount = statsDO != null ? statsDO.getLikeCount() : 0L;

        return ArticleDetailVO.from(staticDto, viewCount, likeCount);
    }

    @Override
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

        // 4. 主动精准失效关联缓存 (Cache Eviction)
        RedisUtils.deleteObject(CacheConstants.ARTICLE_PAGE_DEFAULT);
        if (StringUtils.hasText(article.getSlug())) {
            RedisUtils.deleteObject(CacheConstants.ARTICLE_STATIC_PREFIX + article.getSlug().trim());
        }

        return article.getId();
    }

    @Override
    public void incrementViews(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章标识不能为空");
        }
        ArticleDO article = articleMapper.findBySlug(slug.trim())
                .orElseThrow(() -> new BusinessException(ErrorCode.ARTICLE_NOT_FOUND, "文章不存在或已下架"));
        articleStatsMapper.incrementViewCount(article.getId(), 1L);
    }
}

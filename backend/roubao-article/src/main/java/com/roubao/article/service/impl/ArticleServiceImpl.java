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
import com.roubao.article.model.dto.ArticleCreateDTO;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

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
@Slf4j
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
            if (query.getPublished() != null) {
                wrapper.eq(ArticleDO::getPublished, query.getPublished());
            } else if (Boolean.TRUE.equals(query.getPublishedOnly())) {
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

        Map<Long, CategoryDO> categoryMap = categoryIds.isEmpty()
                ? Collections.emptyMap()
                : categoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(CategoryDO::getId, c -> c, (k1, k2) -> k1));

        Set<Long> articleIds = records.stream()
                .map(ArticleDO::getId)
                .collect(Collectors.toSet());

        Map<Long, ArticleStatsDO> statsMap = articleStatsMapper.selectList(
                new LambdaQueryWrapper<ArticleStatsDO>().in(ArticleStatsDO::getArticleId, articleIds)
        ).stream().collect(Collectors.toMap(ArticleStatsDO::getArticleId, s -> s, (s1, s2) -> s1));

        List<ArticleListVO> voList = records.stream().map(article -> {
            CategoryDO cat = categoryMap.get(article.getCategoryId());
            String categoryName = cat != null ? cat.getCategoryName() : "";
            String categorySlug = cat != null ? cat.getCategorySlug() : "";
            ArticleStatsDO stats = statsMap.get(article.getId());
            Long viewCount = stats != null ? stats.getViewCount() : 0L;
            Long likeCount = stats != null ? stats.getLikeCount() : 0L;
            return ArticleListVO.from(article, categoryName, categorySlug, viewCount, likeCount);
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
            String categorySlug = categoryDO != null ? categoryDO.getCategorySlug() : "";

            staticDto = ArticleStaticDTO.from(article, markdown, categoryName, categorySlug);
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
    public com.roubao.article.model.vo.ArticleStatsSummaryVO getArticleStatsSummary() {
        Long totalArticles = articleMapper.selectCount(null);
        Long publishedArticles = articleMapper.selectCount(
                new LambdaQueryWrapper<ArticleDO>().eq(ArticleDO::getPublished, true)
        );
        long total = totalArticles != null ? totalArticles : 0L;
        long published = publishedArticles != null ? publishedArticles : 0L;
        long draft = Math.max(0L, total - published);

        // 单步 SQL 聚合计算全站浏览量与点赞数，避免全表加载到堆内存造成 OOM 与 GC 停顿
        ArticleStatsDO aggregate = articleStatsMapper.aggregateTotalStats();
        long totalViews = (aggregate != null && aggregate.getViewCount() != null) ? aggregate.getViewCount() : 0L;
        long totalLikes = (aggregate != null && aggregate.getLikeCount() != null) ? aggregate.getLikeCount() : 0L;

        return new com.roubao.article.model.vo.ArticleStatsSummaryVO(
                total,
                published,
                draft,
                totalViews,
                totalLikes
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createArticle(ArticleDO article, String contentMarkdown) {
        if (article == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章元数据实体不能为空");
        }
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

        // 4. 短事务控制：事务提交后精准失效关联缓存
        evictArticleCacheAfterCommit(article.getSlug());

        return article.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createArticle(ArticleCreateDTO dto) {
        if (dto == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "创建文章参数不能为空");
        }

        ArticleDO article = new ArticleDO();
        article.setCategoryId(dto.categoryId());
        article.setTitle(dto.title());
        article.setSlug(dto.slug());
        article.setSummary(dto.summary());
        article.setCoverImageKey(dto.coverImageKey());
        article.setFileType("md");
        article.setTags(dto.tags());
        article.setReadTimeMinutes(dto.readTimeMinutes());
        article.setSortOrder(dto.sortOrder());
        article.setPublished(Boolean.TRUE.equals(dto.published()));
        article.setTop(Boolean.TRUE.equals(dto.top()));
        article.setFeatured(Boolean.TRUE.equals(dto.featured()));
        article.setPublishedAt(LocalDateTime.now());

        return createArticle(article, dto.contentMarkdown());
    }

    @Override
    public ArticleDetailVO getArticleDetailById(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章 ID 不能为空");
        }
        ArticleDO article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException(ErrorCode.ARTICLE_NOT_FOUND);
        }

        ArticleContentDO contentDO = articleContentMapper.selectOne(
                new LambdaQueryWrapper<ArticleContentDO>().eq(ArticleContentDO::getArticleId, id)
        );
        CategoryDO categoryDO = (article.getCategoryId() != null && article.getCategoryId() > 0)
                ? categoryMapper.selectById(article.getCategoryId())
                : null;
        ArticleStatsDO statsDO = articleStatsMapper.selectOne(
                new LambdaQueryWrapper<ArticleStatsDO>().eq(ArticleStatsDO::getArticleId, id)
        );

        String markdown = contentDO != null ? contentDO.getContentMarkdown() : "";
        String categoryName = categoryDO != null ? categoryDO.getCategoryName() : "";
        String categorySlug = categoryDO != null ? categoryDO.getCategorySlug() : "";
        Long viewCount = statsDO != null ? statsDO.getViewCount() : 0L;
        Long likeCount = statsDO != null ? statsDO.getLikeCount() : 0L;

        return ArticleDetailVO.from(article, markdown, categoryName, categorySlug, viewCount, likeCount);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateArticle(Long id, com.roubao.article.model.dto.ArticleUpdateDTO dto) {
        if (id == null || dto == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章更新入参不能为空");
        }
        ArticleDO existing = articleMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.ARTICLE_NOT_FOUND);
        }

        String oldSlug = existing.getSlug();

        existing.setCategoryId(dto.categoryId());
        existing.setTitle(dto.title().trim());
        existing.setSlug(dto.slug().trim());
        existing.setSummary(dto.summary() != null ? dto.summary().trim() : "");
        existing.setCoverImageKey(dto.coverImageKey() != null ? dto.coverImageKey().trim() : "");
        existing.setTags(dto.tags() != null ? dto.tags() : Collections.emptyList());
        existing.setReadTimeMinutes(dto.readTimeMinutes() != null ? dto.readTimeMinutes() : 5);
        existing.setSortOrder(dto.sortOrder() != null ? dto.sortOrder() : 0);
        existing.setTop(Boolean.TRUE.equals(dto.top()));
        existing.setFeatured(Boolean.TRUE.equals(dto.featured()));

        boolean newPublished = Boolean.TRUE.equals(dto.published());
        if (newPublished && !Boolean.TRUE.equals(existing.getPublished()) && existing.getPublishedAt() == null) {
            existing.setPublishedAt(LocalDateTime.now());
        }
        existing.setPublished(newPublished);

        articleMapper.updateById(existing);

        ArticleContentDO contentDO = articleContentMapper.selectOne(
                new LambdaQueryWrapper<ArticleContentDO>().eq(ArticleContentDO::getArticleId, id)
        );
        if (contentDO == null) {
            contentDO = new ArticleContentDO();
            contentDO.setArticleId(id);
            contentDO.setContentMarkdown(dto.contentMarkdown());
            articleContentMapper.insert(contentDO);
        } else {
            contentDO.setContentMarkdown(dto.contentMarkdown());
            articleContentMapper.updateById(contentDO);
        }

        evictArticleCacheAfterCommit(oldSlug);
        if (oldSlug != null && !oldSlug.equals(existing.getSlug())) {
            evictArticleCacheAfterCommit(existing.getSlug());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteArticle(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章 ID 不能为空");
        }
        ArticleDO article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException(ErrorCode.ARTICLE_NOT_FOUND);
        }
        articleMapper.deleteById(id);
        evictArticleCacheAfterCommit(article.getSlug());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void toggleTop(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章 ID 不能为空");
        }
        ArticleDO article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException(ErrorCode.ARTICLE_NOT_FOUND);
        }
        article.setTop(!Boolean.TRUE.equals(article.getTop()));
        articleMapper.updateById(article);
        evictArticleCacheAfterCommit(article.getSlug());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void toggleFeatured(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章 ID 不能为空");
        }
        ArticleDO article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException(ErrorCode.ARTICLE_NOT_FOUND);
        }
        article.setFeatured(!Boolean.TRUE.equals(article.getFeatured()));
        articleMapper.updateById(article);
        evictArticleCacheAfterCommit(article.getSlug());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePublishStatus(Long id, boolean published) {
        if (id == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章 ID 不能为空");
        }
        ArticleDO article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException(ErrorCode.ARTICLE_NOT_FOUND);
        }
        if (published && !Boolean.TRUE.equals(article.getPublished()) && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        article.setPublished(published);
        articleMapper.updateById(article);
        evictArticleCacheAfterCommit(article.getSlug());
    }

    private void evictArticleCacheAfterCommit(String slug) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    RedisUtils.deleteObject(CacheConstants.ARTICLE_PAGE_DEFAULT);
                    if (StringUtils.hasText(slug)) {
                        RedisUtils.deleteObject(CacheConstants.ARTICLE_STATIC_PREFIX + slug.trim());
                    }
                }
            });
        } else {
            RedisUtils.deleteObject(CacheConstants.ARTICLE_PAGE_DEFAULT);
            if (StringUtils.hasText(slug)) {
                RedisUtils.deleteObject(CacheConstants.ARTICLE_STATIC_PREFIX + slug.trim());
            }
        }
    }

    @Override
    public void incrementViews(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "文章标识不能为空");
        }
        ArticleDO article = articleMapper.findBySlug(slug.trim())
                .orElseThrow(() -> new BusinessException(ErrorCode.ARTICLE_NOT_FOUND, "文章不存在或已下架"));
        int updatedRows = articleStatsMapper.incrementViewCount(article.getId(), 1L);
        if (updatedRows == 0) {
            log.warn("文章统计指标记录不存在，执行原子补偿初始化: articleId={}", article.getId());
            ArticleStatsDO stats = new ArticleStatsDO();
            stats.setArticleId(article.getId());
            stats.setViewCount(1L);
            stats.setLikeCount(0L);
            stats.setShareCount(0L);
            stats.setCommentCount(0L);
            articleStatsMapper.insert(stats);
        }
    }
}

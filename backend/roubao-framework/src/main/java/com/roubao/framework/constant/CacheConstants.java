package com.roubao.framework.constant;

import java.time.Duration;

/**
 * 全局分布式缓存 Key 与 TTL 规范常量字典
 * 集中沉淀全系统业务域缓存前缀与基线过期时间，杜绝各 Service 散落硬编码导致命名冲突与无法跨模块核销
 *
 * @author roubao
 * @since 2026-11-15
 */
public interface CacheConstants {

    /**
     * 全局统一业务根前缀
     */
    String ROOT_PREFIX = "roubao:";

    /**
     * 文章分类全量列表
     */
    String CATEGORY_LIST = ROOT_PREFIX + "category:list";
    Duration CATEGORY_LIST_TTL = Duration.ofHours(24);

    /**
     * 首页精选推荐项目列表
     */
    String PROJECT_FEATURED = ROOT_PREFIX + "project:featured";
    Duration PROJECT_FEATURED_TTL = Duration.ofHours(6);

    /**
     * 首页默认第 1 页文章分页卡片 (无筛选默认条件)
     */
    String ARTICLE_PAGE_DEFAULT = ROOT_PREFIX + "article:page:default:1";
    Duration ARTICLE_PAGE_DEFAULT_TTL = Duration.ofMinutes(15);

    /**
     * 文章静态长正文与元数据前缀 (需拼接 slug)
     * e.g. roubao:article:static:{slug}
     */
    String ARTICLE_STATIC_PREFIX = ROOT_PREFIX + "article:static:";
    Duration ARTICLE_STATIC_TTL = Duration.ofHours(2);

    /**
     * 空值防穿透标记过期时间 (Null-Object Cache)
     */
    Duration NULL_CACHE_TTL = Duration.ofSeconds(60);
}


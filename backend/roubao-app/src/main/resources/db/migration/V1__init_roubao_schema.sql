-- ==============================================================================
-- 肉包博客系统 (roubao) - MySQL 数据库初始化 DDL 脚本
-- 版本: V1.0.0 (Flyway: V1__init_roubao_schema.sql)
-- 适用数据库: MySQL 8.0+
-- 包含核心表:
--   - tb_category: 文章分类字典表
--   - tb_article: 文章主体元数据表
--   - tb_article_content: 文章正文大字段扩展表 (垂直拆分)
--   - tb_article_stats: 文章高频统计指标表 (冷热解耦)
--   - tb_project: 开源项目展厅表
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. 文章分类字典表 (tb_category)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_category` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '分类主键ID',
    `category_name` varchar(64) NOT NULL DEFAULT '' COMMENT '分类名称（如：后端架构、前端工程）',
    `category_slug` varchar(64) NOT NULL DEFAULT '' COMMENT '分类英文路由标识（如：backend, frontend）',
    `description` varchar(255) NOT NULL DEFAULT '' COMMENT '分类定位与受众描述',
    `icon_name` varchar(64) NOT NULL DEFAULT '' COMMENT '前端图标标识（如：Server, Cpu, Layout, Boxes）',
    `sort_order` int unsigned NOT NULL DEFAULT 0 COMMENT '排序权重（数值越大越靠前）',
    `is_deleted` tinyint unsigned NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0-未删除, 1-已删除',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后修改时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_category_slug` (`category_slug`),
    KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章分类字典表';

-- ------------------------------------------------------------------------------
-- 2. 文章核心元数据表 (tb_article)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_article` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '文章主键ID',
    `category_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT '所属分类ID（对应tb_category.id，应用层弱关联）',
    `title` varchar(128) NOT NULL DEFAULT '' COMMENT '文章主标题',
    `slug` varchar(128) NOT NULL DEFAULT '' COMMENT '文章URL唯一标识路径（SEO与人类可读Slug）',
    `summary` varchar(500) NOT NULL DEFAULT '' COMMENT '文章导读摘要',
    `cover_image_key` varchar(255) NOT NULL DEFAULT '' COMMENT '封面图在对象存储中的相对Key(如: covers/2026/11/threads.webp)',
    `content_url` varchar(255) NOT NULL DEFAULT '' COMMENT '静态Markdown原稿OSS/CDN外链(可选)',
    `file_type` varchar(16) NOT NULL DEFAULT 'md' COMMENT '正文格式类型: md-Markdown, pdf-文档',
    `tags` json DEFAULT NULL COMMENT '技术标签列表(JSON数组，如:["Java 21", "Spring Boot", "性能优化"])',
    `read_time_minutes` smallint unsigned NOT NULL DEFAULT 1 COMMENT '预估阅读耗时(分钟)',
    `sort_order` int unsigned NOT NULL DEFAULT 0 COMMENT '列表置顶权重(数字越大越靠前)',
    `is_published` tinyint unsigned NOT NULL DEFAULT 0 COMMENT '发布状态: 0-草稿, 1-正式发布',
    `is_top` tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否置顶: 0-否, 1-置顶',
    `is_featured` tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否编辑精选: 0-否, 1-精选',
    `is_deleted` tinyint unsigned NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0-正常未删除, 1-已删除',
    `published_at` datetime DEFAULT NULL COMMENT '正式公开发布时间',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后修改时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_article_slug` (`slug`),
    KEY `idx_category_published_top` (`category_id`, `is_published`, `is_top`, `sort_order`),
    KEY `idx_published_at` (`published_at`),
    KEY `idx_gmt_create` (`gmt_create`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章主体元数据表';

-- ------------------------------------------------------------------------------
-- 3. 文章长正文扩展表 (tb_article_content)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_article_content` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
    `article_id` bigint unsigned NOT NULL COMMENT '文章ID（关联tb_article.id，1对1映射）',
    `content_markdown` mediumtext NOT NULL COMMENT '文章完整Markdown富文本源码',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后修改时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_content_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章长正文扩展内容表';

-- ------------------------------------------------------------------------------
-- 4. 文章高频统计指标表 (tb_article_stats)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_article_stats` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '自增主键ID',
    `article_id` bigint unsigned NOT NULL COMMENT '文章ID（关联tb_article.id，1对1映射）',
    `view_count` int unsigned NOT NULL DEFAULT 0 COMMENT '累计阅读浏览总量',
    `like_count` int unsigned NOT NULL DEFAULT 0 COMMENT '累计点赞总量',
    `share_count` int unsigned NOT NULL DEFAULT 0 COMMENT '累计分享总量',
    `comment_count` int unsigned NOT NULL DEFAULT 0 COMMENT '累计评论总量',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后修改时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_stats_article_id` (`article_id`),
    KEY `idx_view_count` (`view_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章高频统计指标表';

-- ------------------------------------------------------------------------------
-- 5. 开源与实战项目展厅表 (tb_project)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_project` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '项目主键ID',
    `project_name` varchar(64) NOT NULL DEFAULT '' COMMENT '项目名称（如：Roubao Gateway）',
    `slug` varchar(64) NOT NULL DEFAULT '' COMMENT '项目唯一URL标识路径（如：roubao-gateway）',
    `tagline` varchar(128) NOT NULL DEFAULT '' COMMENT '项目一句话亮点标语',
    `description` varchar(1000) NOT NULL DEFAULT '' COMMENT '项目核心背景与架构概述',
    `architecture_highlights` json DEFAULT NULL COMMENT '核心架构亮点列表（JSON数组格式）',
    `tech_tags` json DEFAULT NULL COMMENT '关键技术栈标签列表（JSON数组格式）',
    `repo_url` varchar(255) NOT NULL DEFAULT '' COMMENT '开源仓库GitHub/Gitee地址',
    `demo_url` varchar(255) NOT NULL DEFAULT '' COMMENT '在线演示Demo或文档链接',
    `star_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'GitHub Star统计数',
    `metrics_summary` varchar(128) NOT NULL DEFAULT '' COMMENT '实测性能指标（如：38K QPS / P99 4.2ms）',
    `sort_order` int unsigned NOT NULL DEFAULT 0 COMMENT '排序权重（数值越大越靠前）',
    `is_featured` tinyint unsigned NOT NULL DEFAULT 0 COMMENT '是否首页精选推荐: 0-否, 1-是',
    `is_deleted` tinyint unsigned NOT NULL DEFAULT 0 COMMENT '逻辑删除标记: 0-正常, 1-已删除',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后修改时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_project_slug` (`slug`),
    KEY `idx_featured_sort` (`is_featured`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='开源与实战项目展厅表';

SET FOREIGN_KEY_CHECKS = 1;

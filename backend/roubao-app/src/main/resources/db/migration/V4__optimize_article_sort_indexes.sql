-- ==============================================================================
-- 肉包博客系统 (roubao) - 数据库全站文章无分类排序索引优化脚本
-- 版本: V4 (Flyway: V4__optimize_article_sort_indexes.sql)
-- 适用数据库: MySQL 8.0+
-- 目标: 为 tb_article 表添加无分类排序联合索引 (is_published, sort_order, published_at)，消除 Using filesort 隐患
-- ==============================================================================

SET NAMES utf8mb4;

-- 优化无分类全站检索文章排序联合索引 (is_published, sort_order, published_at)
ALTER TABLE `tb_article` ADD INDEX `idx_published_sort_published_at` (`is_published`, `sort_order`, `published_at`);

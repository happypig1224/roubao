-- ==============================================================================
-- 肉包博客系统 (roubao) - 数据库索引优化迁移脚本
-- 版本: V3 (Flyway: V3__optimize_article_query_indexes.sql)
-- 适用数据库: MySQL 8.0+
-- 目标: 为 tb_article 表添加技术标签首项函数索引，兼容 MySQL 8.0.13+ 全系列版本
-- ==============================================================================

SET NAMES utf8mb4;

-- 优化技术标签首项函数索引
ALTER TABLE `tb_article` ADD INDEX `idx_article_first_tag` ((CAST(`tags`->>'$[0]' AS CHAR(64))));

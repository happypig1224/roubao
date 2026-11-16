CREATE ALIAS IF NOT EXISTS JSON_CONTAINS FOR "com.roubao.framework.util.H2DbFunctions.jsonContains";
CREATE ALIAS IF NOT EXISTS JSON_QUOTE FOR "com.roubao.framework.util.H2DbFunctions.jsonQuote";

CREATE TABLE IF NOT EXISTS `tb_category` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category_name` VARCHAR(64) NOT NULL DEFAULT '',
    `category_slug` VARCHAR(64) NOT NULL DEFAULT '',
    `description` VARCHAR(255) NOT NULL DEFAULT '',
    `icon_name` VARCHAR(64) NOT NULL DEFAULT '',
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_deleted` TINYINT NOT NULL DEFAULT 0,
    `gmt_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `gmt_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `tb_article` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category_id` BIGINT NOT NULL DEFAULT 0,
    `title` VARCHAR(128) NOT NULL DEFAULT '',
    `slug` VARCHAR(128) NOT NULL DEFAULT '',
    `summary` VARCHAR(500) NOT NULL DEFAULT '',
    `cover_image_key` VARCHAR(255) NOT NULL DEFAULT '',
    `content_url` VARCHAR(255) NOT NULL DEFAULT '',
    `file_type` VARCHAR(16) NOT NULL DEFAULT 'md',
    `tags` VARCHAR(1024) DEFAULT NULL,
    `read_time_minutes` SMALLINT NOT NULL DEFAULT 1,
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_published` TINYINT NOT NULL DEFAULT 0,
    `is_top` TINYINT NOT NULL DEFAULT 0,
    `is_featured` TINYINT NOT NULL DEFAULT 0,
    `is_deleted` TINYINT NOT NULL DEFAULT 0,
    `published_at` TIMESTAMP NULL DEFAULT NULL,
    `gmt_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `gmt_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `tb_article_content` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `article_id` BIGINT NOT NULL,
    `content_markdown` CLOB NOT NULL,
    `gmt_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `gmt_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `tb_article_stats` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `article_id` BIGINT NOT NULL,
    `view_count` BIGINT NOT NULL DEFAULT 0,
    `like_count` BIGINT NOT NULL DEFAULT 0,
    `share_count` BIGINT NOT NULL DEFAULT 0,
    `comment_count` BIGINT NOT NULL DEFAULT 0,
    `gmt_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `gmt_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `tb_project` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `project_name` VARCHAR(64) NOT NULL DEFAULT '',
    `slug` VARCHAR(64) NOT NULL DEFAULT '',
    `tagline` VARCHAR(128) NOT NULL DEFAULT '',
    `description` VARCHAR(1000) NOT NULL DEFAULT '',
    `architecture_highlights` VARCHAR(2048) DEFAULT NULL,
    `tech_tags` VARCHAR(2048) DEFAULT NULL,
    `repo_url` VARCHAR(255) NOT NULL DEFAULT '',
    `demo_url` VARCHAR(255) NOT NULL DEFAULT '',
    `star_count` INT NOT NULL DEFAULT 0,
    `metrics_summary` VARCHAR(128) NOT NULL DEFAULT '',
    `sort_order` INT NOT NULL DEFAULT 0,
    `is_featured` TINYINT NOT NULL DEFAULT 0,
    `is_deleted` TINYINT NOT NULL DEFAULT 0,
    `gmt_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `gmt_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

MERGE INTO `tb_category` (`id`, `category_name`, `category_slug`, `description`, `icon_name`, `sort_order`, `is_deleted`) KEY(`id`) VALUES
(1, '后端架构', 'backend', 'Java 21、Spring Boot 3、微服务高并发与底层原理', 'Server', 100, 0),
(2, '前端工程', 'frontend', 'Next.js 16、React 19、Tailwind CSS 与交互打磨', 'Layout', 90, 0),
(3, '性能调优', 'performance', '系统全链路压测、JVM 调优、Redis 与 MySQL 优化', 'Cpu', 80, 0),
(4, '系统架构', 'architecture', '分布式架构设计、Docker 容器化与运维部署', 'Boxes', 70, 0);

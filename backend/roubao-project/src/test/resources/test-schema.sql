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

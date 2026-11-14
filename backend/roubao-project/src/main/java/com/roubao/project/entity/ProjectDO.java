package com.roubao.project.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.roubao.framework.config.JsonListTypeHandler;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 开源与实战项目展厅实体
 * 对应数据表: tb_project
 *
 * @author roubao
 * @since 2026-11-13
 */
@Getter
@Setter
@ToString
@TableName(value = "tb_project", autoResultMap = true)
public class ProjectDO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 自增主键 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 项目名称 (如: Roubao Gateway)
     */
    @TableField("project_name")
    private String projectName;

    /**
     * 项目 URL 唯一标识路径 (如: roubao-gateway)
     */
    @TableField("slug")
    private String slug;

    /**
     * 一句话亮点标语
     */
    @TableField("tagline")
    private String tagline;

    /**
     * 项目核心背景与架构概述
     */
    @TableField("description")
    private String description;

    /**
     * 核心架构亮点列表 (JSON 数组)
     */
    @TableField(value = "architecture_highlights", typeHandler = JsonListTypeHandler.class)
    private List<String> architectureHighlights;

    /**
     * 关键技术栈标签列表 (JSON 数组)
     */
    @TableField(value = "tech_tags", typeHandler = JsonListTypeHandler.class)
    private List<String> techTags;

    /**
     * 源码仓库地址 (GitHub / Gitee)
     */
    @TableField("repo_url")
    private String repoUrl;

    /**
     * 在线演示 Demo 或文档地址
     */
    @TableField("demo_url")
    private String demoUrl;

    /**
     * GitHub Star 统计数
     */
    @TableField("star_count")
    private Integer starCount;

    /**
     * 关键性能指标摘要 (如: 38K QPS / P99 4.2ms)
     */
    @TableField("metrics_summary")
    private String metricsSummary;

    /**
     * 排序权重 (数值越大越靠前)
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 是否首页精选推荐 (0-否, 1-是)
     */
    @TableField("is_featured")
    private Boolean featured;

    /**
     * 逻辑删除标记 (0-正常, 1-已删除)
     */
    @TableLogic
    @TableField("is_deleted")
    private Boolean deleted;

    /**
     * 记录创建时间
     */
    @TableField("gmt_create")
    private LocalDateTime gmtCreate;

    /**
     * 记录最后修改时间
     */
    @TableField("gmt_modified")
    private LocalDateTime gmtModified;
}

package com.roubao.article.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 文章主体元数据实体
 * 对应数据表: tb_article
 *
 * @author roubao
 * @since 2026-11-13
 */
@Getter
@Setter
@ToString
@TableName(value = "tb_article", autoResultMap = true)
public class ArticleDO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 文章主键 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 所属分类 ID (对应 tb_category.id)
     */
    @TableField("category_id")
    private Long categoryId;

    /**
     * 文章主标题
     */
    @TableField("title")
    private String title;

    /**
     * 文章 URL 唯一路由 Slug
     */
    @TableField("slug")
    private String slug;

    /**
     * 文章导读摘要
     */
    @TableField("summary")
    private String summary;

    /**
     * 封面在对象存储中的相对 Key (如: covers/2026/11/threads.webp)
     */
    @TableField("cover_image_key")
    private String coverImageKey;

    /**
     * 静态 Markdown 文件外部下载外链 (可选)
     */
    @TableField("content_url")
    private String contentUrl;

    /**
     * 正文原稿格式类型 (md / pdf)
     */
    @TableField("file_type")
    private String fileType;

    /**
     * 技术标签列表 (JSON 数组)
     */
    @TableField(value = "tags", typeHandler = JacksonTypeHandler.class)
    private List<String> tags;

    /**
     * 预估阅读耗时 (分钟)
     */
    @TableField("read_time_minutes")
    private Integer readTimeMinutes;

    /**
     * 列表排序权重 (越大越靠前)
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 发布状态 (0-草稿, 1-正式发布)
     */
    @TableField("is_published")
    private Boolean published;

    /**
     * 是否置顶 (0-否, 1-置顶)
     */
    @TableField("is_top")
    private Boolean top;

    /**
     * 是否精选推荐 (0-否, 1-精选)
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
     * 正式公开发布时间戳
     */
    @TableField("published_at")
    private LocalDateTime publishedAt;

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

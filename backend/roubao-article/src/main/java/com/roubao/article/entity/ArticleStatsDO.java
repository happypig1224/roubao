package com.roubao.article.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 文章高频统计指标实体
 * 对应数据表: tb_article_stats (冷热解耦，独立承接并发读写)
 *
 * @author roubao
 * @since 2026-11-13
 */
@Getter
@Setter
@ToString
@TableName("tb_article_stats")
public class ArticleStatsDO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 自增主键 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 关联文章 ID (对应 tb_article.id)
     */
    @TableField("article_id")
    private Long articleId;

    /**
     * 累计浏览阅读量
     */
    @TableField("view_count")
    private Long viewCount;

    /**
     * 累计点赞数
     */
    @TableField("like_count")
    private Long likeCount;

    /**
     * 累计分享数
     */
    @TableField("share_count")
    private Long shareCount;

    /**
     * 累计评论数
     */
    @TableField("comment_count")
    private Long commentCount;

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

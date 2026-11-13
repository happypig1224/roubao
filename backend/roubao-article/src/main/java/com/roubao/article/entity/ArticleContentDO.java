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
 * 文章长正文大字段扩展实体
 * 对应数据表: tb_article_content (与 tb_article 1:1 垂直拆分)
 *
 * @author roubao
 * @since 2026-11-13
 */
@Getter
@Setter
@ToString
@TableName("tb_article_content")
public class ArticleContentDO implements Serializable {

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
     * 文章完整 Markdown 源码内容
     */
    @TableField("content_markdown")
    private String contentMarkdown;

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

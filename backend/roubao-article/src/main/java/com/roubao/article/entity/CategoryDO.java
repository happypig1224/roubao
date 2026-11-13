package com.roubao.article.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 文章分类实体
 * 对应数据表: tb_category
 *
 * @author roubao
 * @since 2026-11-13
 */
@Getter
@Setter
@ToString
@TableName("tb_category")
public class CategoryDO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 分类主键 ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 分类名称 (如: 后端架构)
     */
    @TableField("category_name")
    private String categoryName;

    /**
     * 分类英文路由标识 (如: backend)
     */
    @TableField("category_slug")
    private String categorySlug;

    /**
     * 分类定位与受众描述
     */
    @TableField("description")
    private String description;

    /**
     * 图标名称 (如: Server, Cpu)
     */
    @TableField("icon_name")
    private String iconName;

    /**
     * 排序权重 (数值越大越靠前)
     */
    @TableField("sort_order")
    private Integer sortOrder;

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

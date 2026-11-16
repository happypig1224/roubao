package com.roubao.article.model.dto;

import com.roubao.framework.common.PageQuery;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;

/**
 * 文章列表分页筛选查询入参
 *
 * @author roubao
 * @since 2026-11-14
 */
@Getter
@Setter
@ToString(callSuper = true)
public class ArticleQueryDTO extends PageQuery {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 所属分类 ID (可选)
     */
    @Min(value = 1, message = "分类 ID 非法")
    private Long categoryId;

    /**
     * 标签筛选词 (可选)
     */
    @Size(max = 32, message = "标签筛选词长度不能超过 32 个字符")
    private String tag;

    /**
     * 标题或导读模糊搜索关键字 (可选)
     */
    @Size(max = 64, message = "搜索关键字长度不能超过 64 个字符")
    private String keyword;

    /**
     * 是否仅查询已公开发布的文章 (前台默认 true，后台管理可查全部)
     */
    private Boolean publishedOnly = true;

    /**
     * 明确发布状态筛选：true=仅已发布, false=仅草稿, null=全部
     */
    private Boolean published;
}

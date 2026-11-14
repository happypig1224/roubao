package com.roubao.project.model.dto;

import com.roubao.framework.common.PageQuery;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;

/**
 * 开源项目展厅分页查询入参
 *
 * @author roubao
 * @since 2026-11-14
 */
@Getter
@Setter
@ToString(callSuper = true)
public class ProjectQueryDTO extends PageQuery {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 是否仅查询首页精选推荐项目 (可选)
     */
    private Boolean featuredOnly;

    /**
     * 项目名称或技术标签搜索关键字 (可选)
     */
    @Size(max = 64, message = "搜索关键字长度不能超过 64 个字符")
    private String keyword;
}

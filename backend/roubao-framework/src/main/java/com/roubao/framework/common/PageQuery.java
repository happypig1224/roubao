package com.roubao.framework.common;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;

/**
 * 通用分页基础查询参数
 *
 * @author roubao
 * @since 2026-11-14
 */
@Getter
@Setter
@ToString
public class PageQuery implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 当前页码 (从 1 开始)
     */
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码最小为 1")
    private Long pageNo = 1L;

    /**
     * 单页记录数量 (最大限制 100 条)
     */
    @NotNull(message = "每页大小不能为空")
    @Min(value = 1, message = "每页大小最小为 1")
    @Max(value = 100, message = "每页大小最大不能超过 100")
    private Long pageSize = 10L;
}

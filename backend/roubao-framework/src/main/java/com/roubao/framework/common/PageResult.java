package com.roubao.framework.common;

import lombok.Getter;
import lombok.ToString;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collections;
import java.util.List;

/**
 * 全局统一分页响应包装模型
 *
 * @param <T> 列表项数据类型
 * @author roubao
 * @since 2026-11-13
 */
@Getter
@ToString
public class PageResult<T> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 当前页数据记录列表 (只读不可变包装)
     */
    private final List<T> list;

    /**
     * 符合条件的总记录数
     */
    private final long total;

    /**
     * 当前页码 (从 1 开始)
     */
    private final long page;

    /**
     * 每页大小
     */
    private final long size;

    /**
     * 分页全参构造函数
     *
     * @param list  当前页记录列表
     * @param total 总记录数
     * @param page  当前页码
     * @param size  每页大小
     */
    public PageResult(List<T> list, long total, long page, long size) {
        this.list = (list != null) ? Collections.unmodifiableList(list) : Collections.emptyList();
        this.total = total;
        this.page = page;
        this.size = size;
    }

    /**
     * 构建分页结果对象
     *
     * @param list  记录列表
     * @param total 总记录数
     * @param page  当前页
     * @param size  每页大小
     * @param <T>   数据项泛型
     * @return 分页结果实例
     */
    public static <T> PageResult<T> of(List<T> list, long total, long page, long size) {
        return new PageResult<>(list, total, page, size);
    }

    /**
     * 构建空分页结果
     *
     * @param page 当前页码
     * @param size 每页大小
     * @param <T>  数据项泛型
     * @return 空分页结果实例
     */
    public static <T> PageResult<T> empty(long page, long size) {
        return new PageResult<>(Collections.emptyList(), 0L, page, size);
    }
}

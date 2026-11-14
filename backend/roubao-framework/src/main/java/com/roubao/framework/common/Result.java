package com.roubao.framework.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.ToString;
import org.slf4j.MDC;

import java.io.Serial;
import java.io.Serializable;

/**
 * 统一 API 响应包装类
 * 支持全链路日志 TraceId 自动注入与跨端透传
 *
 * @param <T> 数据载荷泛型
 * @author roubao
 * @since 2026-11-13
 */
@Getter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 业务状态码 (0 表示成功)
     */
    private final int code;

    /**
     * 状态提示文本
     */
    private final String message;

    /**
     * 响应数据实体
     */
    private final T data;

    /**
     * 响应时间戳 (毫秒)
     */
    private final long timestamp;

    /**
     * 全链路调用唯一追踪标识
     */
    private final String traceId;

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
        this.traceId = MDC.get("traceId");
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(0, "success", data);
    }

    public static <T> Result<T> success() {
        return new Result<>(0, "success", null);
    }

    public static <T> Result<T> failure(int code, String message) {
        return new Result<>(code, message, null);
    }

    public static <T> Result<T> failure(int code, String message, T data) {
        return new Result<>(code, message, data);
    }
}

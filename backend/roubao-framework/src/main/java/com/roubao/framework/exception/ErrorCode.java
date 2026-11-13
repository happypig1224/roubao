package com.roubao.framework.exception;

import lombok.Getter;

/**
 * 全局业务错误码枚举
 *
 * @author roubao
 * @since 2026-11-13
 */
@Getter
public enum ErrorCode {

    /**
     * 成功状态
     */
    SUCCESS(0, "操作成功"),

    /**
     * 客户端请求参数校验未通过
     */
    BAD_REQUEST(400, "客户端请求参数校验未通过"),

    /**
     * 未通过身份认证或凭证已失效
     */
    UNAUTHORIZED(401, "未通过身份认证，禁止访问"),

    /**
     * 权限不足，拒绝执行
     */
    FORBIDDEN(403, "当前权限不足，拒绝执行"),

    /**
     * 请求的目标资源未找到
     */
    NOT_FOUND(404, "请求的目标资源不存在"),

    /**
     * 请求方法不支持
     */
    METHOD_NOT_ALLOWED(405, "不支持当前 HTTP 请求方法"),

    /**
     * 数据状态冲突或唯一键受限
     */
    CONFLICT(409, "数据状态冲突或唯一约束受限"),

    /**
     * 请求频次触发限流保护
     */
    TOO_MANY_REQUESTS(429, "请求过于频繁，请稍后重试"),

    /**
     * 服务端内部处理异常
     */
    INTERNAL_SERVER_ERROR(500, "服务端内部处理异常"),

    /**
     * 对象存储服务通信异常
     */
    STORAGE_ERROR(502, "对象存储底层通信异常");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}

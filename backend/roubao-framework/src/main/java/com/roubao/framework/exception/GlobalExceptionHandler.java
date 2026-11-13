package com.roubao.framework.exception;

import com.roubao.framework.common.Result;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

/**
 * 全局异常拦截器
 * 处理业务受控异常、参数校验异常及未知服务端异常
 *
 * @author roubao
 * @since 2026-11-13
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException ex) {
        log.warn("业务规则受限拦截: code={}, message={}", ex.getCode(), ex.getMessage());
        return Result.failure(ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        String errorMsg = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("客户端请求参数校验未通过: {}", errorMsg);
        return Result.failure(ErrorCode.BAD_REQUEST.getCode(), errorMsg);
    }

    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleBindException(BindException ex) {
        String errorMsg = ex.getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("请求参数绑定失败: {}", errorMsg);
        return Result.failure(ErrorCode.BAD_REQUEST.getCode(), errorMsg);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleConstraintViolation(ConstraintViolationException ex) {
        log.warn("单参数约束校验未通过: {}", ex.getMessage());
        return Result.failure(ErrorCode.BAD_REQUEST.getCode(), ex.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleNotFound(NoResourceFoundException ex) {
        return Result.failure(ErrorCode.NOT_FOUND.getCode(), "未找到请求的路径资源");
    }

    @ExceptionHandler(Throwable.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Result<Void> handleUnexpectedThrowable(Throwable ex) {
        log.error("系统发生未捕获致命异常: ", ex);
        return Result.failure(ErrorCode.INTERNAL_SERVER_ERROR.getCode(), "系统处理繁忙，请稍后重试");
    }
}

package com.roubao.admin.controller;

import com.roubao.framework.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 管理端安全凭证鉴权与会话探活控制器
 *
 * @author roubao
 * @since 2026-11-16
 */
@RestController
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {

    /**
     * 校验当前 X-Admin-Token 是否合法有效
     * (因挂载在 /api/v1/admin/** 下，通过 AdminAuthInterceptor 校验后即返回成功)
     *
     * @return 鉴权成功标志
     */
    @GetMapping("/verify")
    public Result<Map<String, Object>> verifyToken() {
        return Result.success(Map.of(
                "authenticated", true,
                "role", "ADMIN",
                "message", "Token is valid"
        ));
    }
}

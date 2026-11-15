package com.roubao.framework.util;

/**
 * H2 内存数据库函数扩展别名 (用于在开发/单元测试中模拟 MySQL 原生 JSON 函数)
 * 使业务代码能直接面向生产 MySQL 编写原生标准化 SQL，无需在 Service 层通过 DataSource 嗅探环境
 *
 * @author roubao
 * @since 2026-11-15
 */
public class H2DbFunctions {

    /**
     * 模拟 MySQL JSON_CONTAINS(target, candidate) 函数
     *
     * @param target    JSON 目标字符串/数组
     * @param candidate 匹配候选值
     * @return true=包含
     */
    public static boolean jsonContains(String target, String candidate) {
        if (target == null || candidate == null) {
            return false;
        }
        String cleanValue = candidate.replace("\"", "").trim();
        return target.contains("\"" + cleanValue + "\"") || target.contains(cleanValue);
    }

    /**
     * 模拟 MySQL JSON_QUOTE(string) 函数
     *
     * @param value 原始字符串
     * @return 带引号转义的 JSON 字符串
     */
    public static String jsonQuote(String value) {
        if (value == null) {
            return null;
        }
        return "\"" + value + "\"";
    }
}


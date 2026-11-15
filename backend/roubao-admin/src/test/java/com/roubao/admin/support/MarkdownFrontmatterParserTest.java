package com.roubao.admin.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MarkdownFrontmatterParser 单元测试
 *
 * @author roubao
 * @since 2026-11-15
 */
class MarkdownFrontmatterParserTest {

    private final MarkdownFrontmatterParser parser = new MarkdownFrontmatterParser(new ObjectMapper());

    @Test
    @DisplayName("解析完整 Frontmatter：提取标题、Slug、摘要、标签与估算阅读耗时")
    void shouldParseCompleteFrontmatter() {
        String markdown = """
                ---
                title: "高并发架构实战"
                slug: "high-concurrency-arch"
                category: "backend"
                tags: ["Java", "架构"]
                summary: "深度解析分布式高并发系统设计"
                order: 8
                ---
                # 正文标题
                
                这里是文章正文的第一段内容。
                """;

        MarkdownFrontmatterParser.ParsedMarkdown result = parser.parse(markdown, "default.md");

        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("高并发架构实战");
        assertThat(result.slug()).isEqualTo("high-concurrency-arch");
        assertThat(result.categoryValue()).isEqualTo("backend");
        assertThat(result.tags()).containsExactly("Java", "架构");
        assertThat(result.summary()).isEqualTo("深度解析分布式高并发系统设计");
        assertThat(result.sortOrder()).isEqualTo(8);
        assertThat(result.contentMarkdown()).contains("# 正文标题");
    }

    @Test
    @DisplayName("解析无 Frontmatter 文档：以文件名作为回退标题与 Slug，并自动提取正文首段为摘要")
    void shouldFallbackWhenNoFrontmatter() {
        String markdown = """
                # 简单纯文本
                
                这是文章的第一段摘要描述。
                """;

        MarkdownFrontmatterParser.ParsedMarkdown result = parser.parse(markdown, "my-first-post.md");

        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("my-first-post");
        assertThat(result.slug()).isEqualTo("my-first-post");
        assertThat(result.summary()).contains("这是文章的第一段摘要描述。");
    }
}

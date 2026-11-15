package com.roubao.admin.support;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Markdown Frontmatter 领域解析组件
 * 负责从富文本 Markdown 中提取 YAML Frontmatter 元数据、自动摘取摘要及排版估算
 *
 * @author roubao
 * @since 2026-11-15
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MarkdownFrontmatterParser {

    private final ObjectMapper objectMapper;

    /**
     * 解析 Markdown 源码，提取 Frontmatter 元数据与正文 Markdown
     *
     * @param rawContent       原始 Markdown 文件内容
     * @param originalFilename 原始文件名 (用于默认标题与 Slug 回退)
     * @return 结构化解析结果
     */
    public ParsedMarkdown parse(String rawContent, String originalFilename) {
        String trimmed = rawContent != null ? rawContent.trim() : "";
        Map<String, String> metaMap = new HashMap<>();
        String contentMarkdown = trimmed;

        if (trimmed.startsWith("---")) {
            int secondSeparatorIndex = trimmed.indexOf("---", 3);
            if (secondSeparatorIndex != -1) {
                String frontmatterBlock = trimmed.substring(3, secondSeparatorIndex).trim();
                contentMarkdown = trimmed.substring(secondSeparatorIndex + 3).trim();

                try (BufferedReader reader = new BufferedReader(new StringReader(frontmatterBlock))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        int colonIndex = line.indexOf(':');
                        if (colonIndex > 0) {
                            String key = line.substring(0, colonIndex).trim();
                            String value = line.substring(colonIndex + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                    (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            metaMap.put(key, value);
                        }
                    }
                } catch (IOException ignored) {
                }
            }
        }

        String fallbackBaseName = StringUtils.hasText(originalFilename)
                ? originalFilename.replaceAll("\\.[^.]+$", "")
                : "untitled-post";

        String title = metaMap.getOrDefault("title", fallbackBaseName);
        String slug = metaMap.getOrDefault("slug", fallbackBaseName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", ""));
        String summary = metaMap.getOrDefault("summary", "");
        if (!StringUtils.hasText(summary)) {
            summary = extractSummaryFromContent(contentMarkdown);
        }

        String coverImageKey = metaMap.getOrDefault("cover", "");
        String categoryValue = metaMap.getOrDefault("category", "backend");

        List<String> tags = new ArrayList<>();
        String tagsRaw = metaMap.get("tags");
        if (StringUtils.hasText(tagsRaw)) {
            if (tagsRaw.startsWith("[") && tagsRaw.endsWith("]")) {
                try {
                    tags = objectMapper.readValue(tagsRaw, new TypeReference<List<String>>() {});
                } catch (Exception e) {
                    log.warn("解析 tags JSON 数组失败，尝试降级逗号分隔: {}", tagsRaw);
                    tags = parseCommaSeparatedTags(tagsRaw.substring(1, tagsRaw.length() - 1));
                }
            } else {
                tags = parseCommaSeparatedTags(tagsRaw);
            }
        }

        int wordCount = contentMarkdown.length();
        int readTimeMinutes = Math.max(1, wordCount / 400);

        int sortOrder = 0;
        try {
            if (metaMap.containsKey("order")) {
                sortOrder = Integer.parseInt(metaMap.get("order"));
            }
        } catch (NumberFormatException ignored) {
        }

        return new ParsedMarkdown(title, slug, summary, coverImageKey, categoryValue, tags, readTimeMinutes, sortOrder, contentMarkdown);
    }

    private List<String> parseCommaSeparatedTags(String raw) {
        List<String> list = new ArrayList<>();
        for (String item : raw.split(",")) {
            String clean = item.trim().replaceAll("^[\"']|[\"']$", "");
            if (StringUtils.hasText(clean)) {
                list.add(clean);
            }
        }
        return list;
    }

    private String extractSummaryFromContent(String markdown) {
        if (!StringUtils.hasText(markdown)) {
            return "暂无文章摘要";
        }
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new StringReader(markdown))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String clean = line.trim();
                if (clean.isEmpty() || clean.startsWith("#") || clean.startsWith("```") || clean.startsWith(">") || clean.startsWith("-") || clean.startsWith("*")) {
                    continue;
                }
                sb.append(clean).append(" ");
                if (sb.length() >= 150) {
                    break;
                }
            }
        } catch (IOException ignored) {
        }

        String res = sb.toString().trim();
        return res.length() > 200 ? res.substring(0, 197) + "..." : (res.isEmpty() ? "暂无文章摘要" : res);
    }

    /**
     * 结构化 Frontmatter 结果载荷
     */
    public record ParsedMarkdown(
            String title,
            String slug,
            String summary,
            String coverImageKey,
            String categoryValue,
            List<String> tags,
            Integer readTimeMinutes,
            Integer sortOrder,
            String contentMarkdown
    ) {}
}

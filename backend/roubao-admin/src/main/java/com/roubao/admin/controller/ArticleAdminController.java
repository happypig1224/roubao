package com.roubao.admin.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.roubao.article.entity.ArticleDO;
import com.roubao.article.model.vo.CategoryVO;
import com.roubao.article.service.ArticleService;
import com.roubao.article.service.CategoryService;
import com.roubao.framework.common.Result;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 后台文章管理与 Markdown 文件上传接入控制器
 * 支持直接导入 Markdown 原文，自动解析 Frontmatter 元数据并持久化入库
 *
 * @author roubao
 * @since 2026-11-14
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/articles")
@RequiredArgsConstructor
public class ArticleAdminController {

    private final ArticleService articleService;
    private final CategoryService categoryService;
    private final ObjectMapper objectMapper;

    /**
     * 上传并解析 Markdown 文档原子入库
     *
     * @param file 上传的 .md 文档文件
     * @return 生成的文章主键 ID
     */
    @PostMapping("/upload")
    public Result<Long> uploadMarkdown(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "上传的 Markdown 文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        if (StringUtils.hasText(originalFilename) && !originalFilename.endsWith(".md") && !originalFilename.endsWith(".markdown")) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "仅支持上传 .md 或 .markdown 格式的文件");
        }

        String rawContent;
        try {
            rawContent = new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("读取上传文件内容失败", e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "读取上传文档内容失败");
        }

        ParsedMarkdown parsed = parseMarkdownWithFrontmatter(rawContent, originalFilename);

        // 匹配所属分类 ID
        Long categoryId = resolveCategoryId(parsed.categoryValue());

        ArticleDO article = new ArticleDO();
        article.setCategoryId(categoryId);
        article.setTitle(parsed.title());
        article.setSlug(parsed.slug());
        article.setSummary(parsed.summary());
        article.setCoverImageKey(parsed.coverImageKey());
        article.setFileType("md");
        article.setTags(parsed.tags());
        article.setReadTimeMinutes(parsed.readTimeMinutes());
        article.setSortOrder(parsed.sortOrder());
        article.setPublished(true);
        article.setTop(false);
        article.setFeatured(false);
        article.setPublishedAt(LocalDateTime.now());

        Long articleId = articleService.createArticle(article, parsed.contentMarkdown());
        return Result.success(articleId);
    }

    private ParsedMarkdown parseMarkdownWithFrontmatter(String rawContent, String originalFilename) {
        String trimmed = rawContent.trim();
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

    private Long resolveCategoryId(String categoryValue) {
        List<CategoryVO> categories = categoryService.listCategories();
        if (categories == null || categories.isEmpty()) {
            return 1L;
        }

        // 1. 尝试匹配 categorySlug
        for (CategoryVO cat : categories) {
            if (cat.categorySlug().equalsIgnoreCase(categoryValue)) {
                return cat.id();
            }
        }

        // 2. 尝试匹配 categoryName
        for (CategoryVO cat : categories) {
            if (cat.categoryName().equalsIgnoreCase(categoryValue)) {
                return cat.id();
            }
        }

        // 3. 兜底返回首个分类
        return categories.get(0).id();
    }

    private record ParsedMarkdown(
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

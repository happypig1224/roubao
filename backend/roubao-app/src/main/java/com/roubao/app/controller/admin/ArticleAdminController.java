package com.roubao.app.controller.admin;

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
            int secondMarker = trimmed.indexOf("---", 3);
            if (secondMarker != -1) {
                String frontmatterBlock = trimmed.substring(3, secondMarker).trim();
                contentMarkdown = trimmed.substring(secondMarker + 3).trim();

                try (BufferedReader reader = new BufferedReader(new StringReader(frontmatterBlock))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int colonIndex = line.indexOf(':');
                        if (colonIndex != -1) {
                            String key = line.substring(0, colonIndex).trim();
                            String val = line.substring(colonIndex + 1).trim();
                            // 去除首尾包裹的双引号或单引号
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1);
                            }
                            metaMap.put(key, val);
                        }
                    }
                } catch (IOException ignored) {
                }
            }
        }

        // 1. 标题提取 (优先 Frontmatter，其次提取第一个一级标题，兜底为文件名)
        String title = metaMap.get("title");
        if (!StringUtils.hasText(title)) {
            title = extractTitleFromContent(contentMarkdown, originalFilename);
        }

        // 2. Slug 提取 (优先 Frontmatter，兜底基于 title 或文件名生成)
        String slug = metaMap.get("slug");
        if (!StringUtils.hasText(slug)) {
            slug = generateSlugFromTitle(title, originalFilename);
        }

        // 3. 摘要提取
        String summary = metaMap.get("summary");
        if (!StringUtils.hasText(summary)) {
            summary = generateSummaryFromContent(contentMarkdown);
        }

        // 4. 标签解析
        List<String> tags = parseTags(metaMap.get("tags"));

        // 5. 排序权重与阅读时长
        int sortOrder = 0;
        if (metaMap.containsKey("weight")) {
            try {
                sortOrder = Integer.parseInt(metaMap.get("weight"));
            } catch (NumberFormatException ignored) {
            }
        }

        int readTimeMinutes = Math.max(1, (int) Math.ceil(contentMarkdown.length() / 400.0));
        if (metaMap.containsKey("readTimeMinutes")) {
            try {
                readTimeMinutes = Integer.parseInt(metaMap.get("readTimeMinutes"));
            } catch (NumberFormatException ignored) {
            }
        }

        String coverImageKey = metaMap.getOrDefault("coverImageKey", metaMap.get("cover_image_key"));
        if (!StringUtils.hasText(coverImageKey)) {
            coverImageKey = "covers/default-article.webp";
        }

        String categoryValue = metaMap.get("category");

        return new ParsedMarkdown(title, slug, summary, categoryValue, tags, sortOrder, readTimeMinutes, coverImageKey, contentMarkdown);
    }

    private Long resolveCategoryId(String categoryValue) {
        List<CategoryVO> categories = categoryService.listCategories();
        if (categories.isEmpty()) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "系统中尚无有效分类数据");
        }

        if (StringUtils.hasText(categoryValue)) {
            String val = categoryValue.trim();
            for (CategoryVO cat : categories) {
                if (val.equalsIgnoreCase(cat.categorySlug()) || val.equalsIgnoreCase(cat.categoryName()) || String.valueOf(cat.id()).equals(val)) {
                    return cat.id();
                }
            }
        }

        // 默认关联首个分类
        return categories.get(0).id();
    }

    private List<String> parseTags(String tagsRaw) {
        if (!StringUtils.hasText(tagsRaw)) {
            return new ArrayList<>();
        }
        String trimmed = tagsRaw.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                return objectMapper.readValue(trimmed, new TypeReference<List<String>>() {});
            } catch (Exception ignored) {
            }
        }

        // 按逗号分割
        String[] parts = trimmed.split("[,，]");
        List<String> list = new ArrayList<>();
        for (String p : parts) {
            String tag = p.trim().replaceAll("^[\"']|[\"']$", "");
            if (!tag.isEmpty()) {
                list.add(tag);
            }
        }
        return list;
    }

    private String extractTitleFromContent(String content, String originalFilename) {
        if (StringUtils.hasText(content)) {
            for (String line : content.split("\\r?\\n")) {
                String trimmed = line.trim();
                if (trimmed.startsWith("# ")) {
                    return trimmed.substring(2).trim();
                }
            }
        }
        if (StringUtils.hasText(originalFilename)) {
            return originalFilename.replaceFirst("\\.[^.]+$", "");
        }
        return "Untitled Post " + System.currentTimeMillis();
    }

    private String generateSlugFromTitle(String title, String originalFilename) {
        String base = (StringUtils.hasText(originalFilename))
                ? originalFilename.replaceFirst("\\.[^.]+$", "")
                : title;
        String slug = base.toLowerCase().trim().replaceAll("[^a-z0-9\\-_]+", "-").replaceAll("^-+|-+$", "");
        if (!StringUtils.hasText(slug)) {
            slug = "post-" + Math.abs(base.hashCode());
        }
        return slug;
    }

    private String generateSummaryFromContent(String content) {
        if (!StringUtils.hasText(content)) {
            return "暂无摘要";
        }
        String clean = content.replaceAll("#+\\s+.*", "").replaceAll("[`*_\\[\\]()]", "").trim();
        if (clean.length() <= 150) {
            return clean;
        }
        return clean.substring(0, 150) + "...";
    }

    private record ParsedMarkdown(
            String title,
            String slug,
            String summary,
            String categoryValue,
            List<String> tags,
            int sortOrder,
            int readTimeMinutes,
            String coverImageKey,
            String contentMarkdown
    ) {}
}


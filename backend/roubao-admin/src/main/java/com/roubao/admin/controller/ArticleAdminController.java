package com.roubao.admin.controller;

import com.roubao.admin.support.MarkdownFrontmatterParser;
import com.roubao.admin.support.MarkdownFrontmatterParser.ParsedMarkdown;
import com.roubao.article.model.dto.ArticleCreateDTO;
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

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 后台文章管理与 Markdown 文件上传接入控制器
 * 严格遵守单一职责原则，仅负责参数绑定、权限分发与统一响应，复杂解析委托领域解析组件
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
    private final MarkdownFrontmatterParser markdownFrontmatterParser;

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

        // 委托领域解析组件解析 Frontmatter
        ParsedMarkdown parsed = markdownFrontmatterParser.parse(rawContent, originalFilename);

        // 匹配所属分类 ID
        Long categoryId = resolveCategoryId(parsed.categoryValue());

        ArticleCreateDTO createDTO = new ArticleCreateDTO(
                categoryId,
                parsed.title(),
                parsed.slug(),
                parsed.summary(),
                parsed.coverImageKey(),
                parsed.tags(),
                parsed.readTimeMinutes(),
                parsed.sortOrder(),
                true,
                false,
                false,
                parsed.contentMarkdown()
        );

        Long articleId = articleService.createArticle(createDTO);
        return Result.success(articleId);
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
}

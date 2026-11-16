package com.roubao.admin.controller;

import com.roubao.admin.support.MarkdownFrontmatterParser;
import com.roubao.admin.support.MarkdownFrontmatterParser.ParsedMarkdown;
import com.roubao.article.model.dto.ArticleCreateDTO;
import com.roubao.article.model.dto.ArticleQueryDTO;
import com.roubao.article.model.dto.ArticleUpdateDTO;
import com.roubao.article.model.vo.ArticleDetailVO;
import com.roubao.article.model.vo.ArticleListVO;
import com.roubao.article.model.vo.CategoryVO;
import com.roubao.article.service.ArticleService;
import com.roubao.article.service.CategoryService;
import com.roubao.framework.common.PageResult;
import com.roubao.framework.common.Result;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 后台文章管理与 Markdown 文件上传接入控制器
 * 严格遵守单一职责原则，仅负责参数绑定、权限分发与统一响应，复杂业务逻辑委托领域服务
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
     * 分页查询文章列表 (管理端默认查询全量状态，支持关键词、分类、发布状态筛选)
     *
     * @param query 查询参数
     * @return 分页文章列表
     */
    @GetMapping
    public Result<PageResult<ArticleListVO>> pageArticles(@Valid @ModelAttribute ArticleQueryDTO query) {
        // 管理端默认查全部文章 (若未显式指定 publishedOnly 或 published)
        if (query != null && query.getPublished() == null && Boolean.TRUE.equals(query.getPublishedOnly())) {
            query.setPublishedOnly(false);
        }
        return Result.success(articleService.pageArticles(query));
    }

    /**
     * 根据主键 ID 查询文章完整详情
     *
     * @param id 文章主键 ID
     * @return 文章详情 VO
     */
    @GetMapping("/{id}")
    public Result<ArticleDetailVO> getArticleDetailById(@PathVariable Long id) {
        return Result.success(articleService.getArticleDetailById(id));
    }

    /**
     * 直接新增文章
     *
     * @param dto 文章创建入参
     * @return 生成的文章主键 ID
     */
    @PostMapping
    public Result<Long> createArticle(@Valid @RequestBody ArticleCreateDTO dto) {
        Long articleId = articleService.createArticle(dto);
        log.info("管理端创建文章成功: [id={}, title={}, slug={}]", articleId, dto.title(), dto.slug());
        return Result.success(articleId);
    }

    /**
     * 更新文章信息及正文内容
     *
     * @param id  文章主键 ID
     * @param dto 文章更新入参
     * @return 空成功响应
     */
    @PutMapping("/{id}")
    public Result<Void> updateArticle(@PathVariable Long id, @Valid @RequestBody ArticleUpdateDTO dto) {
        articleService.updateArticle(id, dto);
        log.info("管理端更新文章成功: [id={}, title={}, slug={}]", id, dto.title(), dto.slug());
        return Result.success();
    }

    /**
     * 逻辑删除指定文章
     *
     * @param id 文章主键 ID
     * @return 空成功响应
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        log.info("管理端删除文章成功: [id={}]", id);
        return Result.success();
    }

    /**
     * 切换文章置顶状态
     *
     * @param id 文章主键 ID
     * @return 空成功响应
     */
    @PatchMapping("/{id}/top")
    public Result<Void> toggleTop(@PathVariable Long id) {
        articleService.toggleTop(id);
        log.info("管理端切换文章置顶成功: [id={}]", id);
        return Result.success();
    }

    /**
     * 切换文章精选状态
     *
     * @param id 文章主键 ID
     * @return 空成功响应
     */
    @PatchMapping("/{id}/featured")
    public Result<Void> toggleFeatured(@PathVariable Long id) {
        articleService.toggleFeatured(id);
        log.info("管理端切换文章精选推荐成功: [id={}]", id);
        return Result.success();
    }

    /**
     * 更新文章上下线发布状态
     *
     * @param id        文章主键 ID
     * @param published 是否公开发布
     * @return 空成功响应
     */
    @PatchMapping("/{id}/publish")
    public Result<Void> updatePublishStatus(@PathVariable Long id, @RequestParam boolean published) {
        articleService.updatePublishStatus(id, published);
        log.info("管理端更新文章发布状态成功: [id={}, published={}]", id, published);
        return Result.success();
    }

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

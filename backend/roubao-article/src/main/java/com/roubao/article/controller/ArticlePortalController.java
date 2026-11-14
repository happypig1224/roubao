package com.roubao.article.controller;

import com.roubao.article.model.dto.ArticleQueryDTO;
import com.roubao.article.model.vo.ArticleDetailVO;
import com.roubao.article.model.vo.ArticleListVO;
import com.roubao.article.service.ArticleService;
import com.roubao.framework.common.PageResult;
import com.roubao.framework.common.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 文章前台门户 REST 接入控制器
 * 提供面向访客与搜索引擎的公开只读文章数据与阅读量统计端点
 *
 * @author roubao
 * @since 2026-11-14
 */
@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticlePortalController {

    private final ArticleService articleService;

    /**
     * 分页查询文章卡片列表 (支持分类、标签与关键字复合检索)
     *
     * @param query 分页与过滤入参
     * @return 统一分页视图包装
     */
    @GetMapping
    public Result<PageResult<ArticleListVO>> pageArticles(@Valid ArticleQueryDTO query) {
        PageResult<ArticleListVO> pageResult = articleService.pageArticles(query);
        return Result.success(pageResult);
    }

    /**
     * 根据 Slug 路由标识查询文章完整详情 (聚合元数据、Markdown 正文及阅读/点赞指标)
     *
     * @param slug 路径别名
     * @return 文章完整详情视图
     */
    @GetMapping("/{slug}")
    public Result<ArticleDetailVO> getArticleBySlug(@PathVariable("slug") String slug) {
        ArticleDetailVO detail = articleService.getArticleDetailBySlug(slug);
        return Result.success(detail);
    }

    /**
     * 文章阅读量自增打点
     *
     * @param slug 路径别名
     * @return 操作成功结果
     */
    @PostMapping("/{slug}/views")
    public Result<Void> incrementViews(@PathVariable("slug") String slug) {
        articleService.incrementViews(slug);
        return Result.success();
    }
}

package com.roubao.article.service;

import com.roubao.article.entity.ArticleDO;
import com.roubao.article.model.dto.ArticleCreateDTO;
import com.roubao.article.model.dto.ArticleQueryDTO;
import com.roubao.article.model.vo.ArticleDetailVO;
import com.roubao.article.model.vo.ArticleListVO;
import com.roubao.framework.common.PageResult;
import com.roubao.framework.exception.BusinessException;
import com.roubao.framework.exception.ErrorCode;

import com.roubao.article.model.dto.ArticleUpdateDTO;

/**
 * 文章业务领域服务接口
 *
 * @author roubao
 * @since 2026-11-14
 */
public interface ArticleService {

    /**
     * 多条件分页查询文章列表 (按权重倒序 + 发布时间倒序)
     *
     * @param query 查询参数
     * @return 分页文章列表 VO
     */
    PageResult<ArticleListVO> pageArticles(ArticleQueryDTO query);

    /**
     * 根据 Slug 唯一路由查询文章详情 (聚合元数据、正文 Markdown 与统计指标)
     *
     * @param slug 路径标识
     * @return 文章详情 VO
     */
    ArticleDetailVO getArticleDetailBySlug(String slug);

    /**
     * 根据主键 ID 查询文章完整详情
     *
     * @param id 文章主键 ID
     * @return 文章详情 VO
     */
    ArticleDetailVO getArticleDetailById(Long id);

    /**
     * 获取全站文章与冷热指标大盘概览统计
     *
     * @return 大盘指标统计 VO
     */
    com.roubao.article.model.vo.ArticleStatsSummaryVO getArticleStatsSummary();

    /**
     * 更新文章信息与正文大字段
     *
     * @param id  文章主键 ID
     * @param dto 文章更新入参 DTO
     */
    void updateArticle(Long id, ArticleUpdateDTO dto);

    /**
     * 逻辑删除文章并失效关联缓存
     *
     * @param id 文章主键 ID
     */
    void deleteArticle(Long id);

    /**
     * 切换文章置顶状态
     *
     * @param id 文章主键 ID
     */
    void toggleTop(Long id);

    /**
     * 切换文章精选推荐状态
     *
     * @param id 文章主键 ID
     */
    void toggleFeatured(Long id);

    /**
     * 更新文章发布状态 (上线/下线为草稿)
     *
     * @param id        文章主键 ID
     * @param published 是否发布
     */
    void updatePublishStatus(Long id, boolean published);

    /**
     * 原子创建文章 (推荐：跨模块解耦，短事务控制与提交后缓存失效)
     *
     * @param dto 文章创建入参 DTO
     * @return 生成的文章 ID
     */
    Long createArticle(ArticleCreateDTO dto);

    /**
     * 兼容创建文章 (实体入参)
     *
     * @param article         文章元数据实体
     * @param contentMarkdown 正文 Markdown 内容
     * @return 生成的文章 ID
     */
    Long createArticle(ArticleDO article, String contentMarkdown);

    /**
     * 累加文章阅读量
     *
     * @param slug 路径标识
     */
    void incrementViews(String slug);

    /**
     * 验证当前服务是否接入 Java 21 虚拟线程调度支持
     *
     * @return 是否支持虚拟线程调度
     */
    default boolean isVirtualThreadExecutionSupported() {
        return true;
    }
}


package com.roubao.article.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.roubao.article.entity.ArticleStatsDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.Optional;

/**
 * 文章高频统计指标持久层映射器
 *
 * @author roubao
 * @since 2026-11-13
 */
@Mapper
public interface ArticleStatsMapper extends BaseMapper<ArticleStatsDO> {

    /**
     * 根据文章 ID 查询统计指标数据
     *
     * @param articleId 文章 ID
     * @return 统计指标实体 Optional
     */
    @Select("""
            SELECT id, article_id, view_count, like_count, share_count, comment_count, gmt_create, gmt_modified
            FROM tb_article_stats
            WHERE article_id = #{articleId}
            LIMIT 1
            """)
    Optional<ArticleStatsDO> findByArticleId(@Param("articleId") Long articleId);

    /**
     * 原子自增文章阅读量
     *
     * @param articleId 文章 ID
     * @param delta     增量数值
     * @return 影响行数
     */
    @Update("""
            UPDATE tb_article_stats
            SET view_count = view_count + #{delta}
            WHERE article_id = #{articleId}
            """)
    int incrementViewCount(@Param("articleId") Long articleId, @Param("delta") long delta);

    /**
     * 原子自增文章点赞数
     *
     * @param articleId 文章 ID
     * @param delta     增量数值
     * @return 影响行数
     */
    @Update("""
            UPDATE tb_article_stats
            SET like_count = like_count + #{delta}
            WHERE article_id = #{articleId}
            """)
    int incrementLikeCount(@Param("articleId") Long articleId, @Param("delta") long delta);
}

package com.roubao.article.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.roubao.article.entity.ArticleContentDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.Optional;

/**
 * 文章长正文大字段持久层映射器
 *
 * @author roubao
 * @since 2026-11-13
 */
@Mapper
public interface ArticleContentMapper extends BaseMapper<ArticleContentDO> {

    /**
     * 根据文章 ID 查询对应的 Markdown 正文内容
     *
     * @param articleId 文章 ID
     * @return 正文扩展实体 Optional
     */
    @Select("""
            SELECT id, article_id, content_markdown, gmt_create, gmt_modified
            FROM tb_article_content
            WHERE article_id = #{articleId}
            LIMIT 1
            """)
    Optional<ArticleContentDO> findByArticleId(@Param("articleId") Long articleId);
}

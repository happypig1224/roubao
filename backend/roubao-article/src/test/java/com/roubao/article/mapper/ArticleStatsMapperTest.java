package com.roubao.article.mapper;

import com.roubao.article.entity.ArticleStatsDO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 高频统计指标持久层单元测试
 * 核心验证：冷热解耦隔离、阅读量与点赞数原子自增
 *
 * @author roubao
 * @since 2026-11-13
 */
@SpringBootTest
@Transactional
class ArticleStatsMapperTest {

    @Autowired
    private ArticleStatsMapper articleStatsMapper;

    @Test
    @DisplayName("应该支持原子自增高频阅读量与点赞数")
    void shouldAtomicallyIncrementViewAndLikeCounts() {
        // Arrange
        Long targetArticleId = 999L;
        ArticleStatsDO stats = new ArticleStatsDO();
        stats.setArticleId(targetArticleId);
        stats.setViewCount(100L);
        stats.setLikeCount(10L);
        stats.setShareCount(2L);
        stats.setCommentCount(1L);

        int inserted = articleStatsMapper.insert(stats);
        assertThat(inserted).isEqualTo(1);

        // Act - 原子自增阅读量 +15
        int viewUpdated = articleStatsMapper.incrementViewCount(targetArticleId, 15L);
        assertThat(viewUpdated).isEqualTo(1);

        // Act - 原子自增点赞数 +5
        int likeUpdated = articleStatsMapper.incrementLikeCount(targetArticleId, 5L);
        assertThat(likeUpdated).isEqualTo(1);

        // Assert - 读取并核验证实
        Optional<ArticleStatsDO> statsOpt = articleStatsMapper.findByArticleId(targetArticleId);
        assertThat(statsOpt).isPresent();
        assertThat(statsOpt.get().getViewCount()).isEqualTo(115L);
        assertThat(statsOpt.get().getLikeCount()).isEqualTo(15L);
    }

    @Test
    @DisplayName("应该支持单步 SQL 聚合计算全站总浏览量与总点赞量")
    void shouldAggregateTotalViewsAndLikesViaSql() {
        // Arrange
        ArticleStatsDO s1 = new ArticleStatsDO();
        s1.setArticleId(1001L);
        s1.setViewCount(500L);
        s1.setLikeCount(50L);
        articleStatsMapper.insert(s1);

        ArticleStatsDO s2 = new ArticleStatsDO();
        s2.setArticleId(1002L);
        s2.setViewCount(300L);
        s2.setLikeCount(30L);
        articleStatsMapper.insert(s2);

        // Act
        ArticleStatsDO aggregate = articleStatsMapper.aggregateTotalStats();

        // Assert
        assertThat(aggregate).isNotNull();
        assertThat(aggregate.getViewCount()).isGreaterThanOrEqualTo(800L);
        assertThat(aggregate.getLikeCount()).isGreaterThanOrEqualTo(80L);
    }
}

package com.roubao.app;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Flyway 数据库版本化迁移与数据完整性验收测试
 *
 * @author roubao
 * @since 2026-11-14
 */
@SpringBootTest(classes = RoubaoApplication.class)
class FlywayMigrationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("迁移执行与表结构契约：断言 V1/V2 脚本成功应用，且 5 张核心业务表与索引均成功建立")
    void shouldExecuteFlywayMigrationSuccessfullyAndVerifyTableSchema() throws Exception {
        // 1. 断言 Flyway 迁移状态
        MigrationInfo[] appliedMigrations = flyway.info().applied();
        assertThat(appliedMigrations)
                .as("必须成功应用 V1 和 V2 迁移脚本")
                .hasSizeGreaterThanOrEqualTo(2);

        for (MigrationInfo info : appliedMigrations) {
            assertThat(info.getState().isApplied())
                    .as("迁移版本 %s 状态必须为已应用", info.getVersion())
                    .isTrue();
        }

        // 2. 表结构契约断言：通过 JDBC 元数据检查 5 张核心表是否存在
        List<String> tableNames = new ArrayList<>();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            try (ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    if (tableName != null) {
                        tableNames.add(tableName.toLowerCase());
                    }
                }
            }
        }

        assertThat(tableNames)
                .as("必须成功创建 5 张核心业务表")
                .contains(
                        "tb_category",
                        "tb_article",
                        "tb_article_content",
                        "tb_article_stats",
                        "tb_project"
                );

        // 3. 索引契约断言：验证 tb_article 上的核心联合索引与唯一索引
        List<String> indexNames = new ArrayList<>();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            try (ResultSet rs = metaData.getIndexInfo(null, null, "tb_article", false, false)) {
                while (rs.next()) {
                    String indexName = rs.getString("INDEX_NAME");
                    if (indexName != null) {
                        indexNames.add(indexName.toLowerCase());
                    }
                }
            }
            if (indexNames.isEmpty()) {
                try (ResultSet rs = metaData.getIndexInfo(null, null, "TB_ARTICLE", false, false)) {
                    while (rs.next()) {
                        String indexName = rs.getString("INDEX_NAME");
                        if (indexName != null) {
                            indexNames.add(indexName.toLowerCase());
                        }
                    }
                }
            }
        }

        assertThat(indexNames)
                .as("文章表必须具备 Slug 唯一索引与分类发布置顶联合索引")
                .anyMatch(name -> name.contains("uk_article_slug") || name.contains("slug"))
                .anyMatch(name -> name.contains("idx_category_published_top"));
    }

    @Test
    @DisplayName("种子数据完整性：验证分类字典、博文、正文大字段与冷热统计关联查询无损")
    void shouldVerifyInitialSeedDataIntegrity() {
        // 1. 验证分类字典行数与关键数据
        Integer categoryCount = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM tb_category WHERE is_deleted = 0", Integer.class);
        assertThat(categoryCount).isNotNull().isGreaterThanOrEqualTo(4);

        // 2. 验证开源项目展厅数据
        Integer projectCount = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM tb_project WHERE is_deleted = 0", Integer.class);
        assertThat(projectCount).isNotNull().isGreaterThanOrEqualTo(3);

        // 3. 验证文章跨表关联查询（模拟多表垂直拆分后真实组装）
        String testSlug = "java-21-virtual-threads-benchmark-pitfalls";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT a.id, a.title, a.slug, c.category_name, cnt.content_markdown, s.view_count
                FROM tb_article a
                JOIN tb_category c ON a.category_id = c.id
                JOIN tb_article_content cnt ON a.id = cnt.article_id
                JOIN tb_article_stats s ON a.id = s.article_id
                WHERE a.slug = ?
                """, testSlug);

        assertThat(rows).as("种子文章必须存在且能关联出分类、正文与阅读量").hasSize(1);
        Map<String, Object> articleRow = rows.get(0);
        assertThat(articleRow.get("title")).isEqualTo("Java 21 虚拟线程压测与踩坑记录");
        assertThat(articleRow.get("category_name")).isEqualTo("后端架构");
        assertThat(articleRow.get("content_markdown").toString()).contains("虚拟线程");
        assertThat(((Number) articleRow.get("view_count")).longValue()).isGreaterThan(0L);
    }

    @Test
    @DisplayName("幂等性校验：重复执行 Flyway 迁移或二次调用 migrate 必须幂等，无报错")
    void shouldEnsureFlywayMigrationIsIdempotent() {
        // 重复调用 migrate
        MigrateResult result = flyway.migrate();
        assertThat(result.migrationsExecuted)
                .as("再次执行迁移时因全部版本已处于最新状态，执行迁移数必须为 0")
                .isEqualTo(0);

        // 断言再次执行后，核心数据行数无任何损耗
        Integer categoryCount = jdbcTemplate.queryForObject("SELECT count(*) FROM tb_category", Integer.class);
        assertThat(categoryCount).isNotNull().isGreaterThanOrEqualTo(4);
    }
}

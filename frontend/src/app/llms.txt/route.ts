import { fetchArticles, fetchProjects } from "@/lib/api";
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  GITHUB_URL,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/siteConfig";

export async function GET() {
  const [articles, projects] = await Promise.all([
    fetchArticles(),
    fetchProjects(),
  ]);

  const projectsLines =
    projects.length > 0
      ? projects
          .map((project) => {
            const metricsNote = project.metrics ? ` (${project.metrics})` : "";
            return `- [${project.name}](${project.repoUrl})${metricsNote}: ${project.tagline} — ${project.description}`;
          })
          .join("\n")
      : "- 暂无开源项目展示";

  const articleLines =
    articles.length > 0
      ? articles
          .map(
            (article) =>
              `- [${article.title}](${SITE_URL}/blog/${encodeURIComponent(article.slug)}): ${article.summary}`
          )
          .join("\n")
      : "- 暂无技术文章发布";

  const body = `# ${AUTHOR_NAME}

> ${SITE_DESCRIPTION}

- 主页: ${SITE_URL}
- GitHub: ${GITHUB_URL}
- 坐标: 中国 · 杭州
- 邮箱: ${AUTHOR_EMAIL}
- 工程原则: 清晰的模块边界、短事务设计、单机极致吞吐，避免无意义过度设计。

## 核心工程与开源项目

${projectsLines}

## 技术文章

${articleLines}

## 站点资源

- 技术文章 RSS 源: ${SITE_URL}/rss.xml
- 站点完整地图: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

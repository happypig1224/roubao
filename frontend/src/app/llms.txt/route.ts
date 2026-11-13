import { MOCK_PROJECTS } from "@/data/mockData";
import { getCachedArticles } from "@/lib/articlesStore";
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  GITHUB_URL,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/siteConfig";

export async function GET() {
  const articles = await getCachedArticles();

  const projectsLines = MOCK_PROJECTS.map((project) => {
    const metricsNote = project.metrics ? ` (${project.metrics})` : "";
    return `- [${project.name}](${project.repoUrl})${metricsNote}: ${project.tagline} — ${project.description}`;
  }).join("\n");

  const articleLines = articles
    .map(
      (article) =>
        `- [${article.title}](${SITE_URL}/blog/${encodeURIComponent(article.slug)}): ${article.summary}`
    )
    .join("\n");

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

- [工程履历 PDF](${SITE_URL}/Roubao-Resume-2026.pdf): 肉包 2026 版个人工程履历 PDF 下载
- [RSS 订阅源](${SITE_URL}/rss.xml): 技术文章 RSS 2.0 订阅源
- [站点地图](${SITE_URL}/sitemap.xml): 全站 URL 索引
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

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
- 学历方向: 2027届全日制本科 · 计算机科学与技术
- 邮箱: ${AUTHOR_EMAIL}
- 荣誉: 全国计算机能力挑战赛程序设计东北赛区本研组三等奖、国家三等励志奖学金
- 工程范式: Specs Coding (SDD/TDD) 驱动开发、Claude Code / Gemini 辅助编程、追求清晰模块边界与单机极致吞吐。

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

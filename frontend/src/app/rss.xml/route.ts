import { getCachedArticles } from "@/lib/articlesStore";
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/siteConfig";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await getCachedArticles();

  const itemsXml = articles
    .map((article) => {
      const link = `${SITE_URL}/blog/${encodeURIComponent(article.slug)}`;
      const pubDate = new Date(`${article.publishedAt}T00:00:00.000Z`).toUTCString();
      const categoriesXml = [article.category, ...article.tags]
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.summary)}</description>
${categoriesXml}
    </item>`;
    })
    .join("\n");

  const lastBuildDate =
    articles.length > 0
      ? new Date(`${articles[0].publishedAt}T00:00:00.000Z`).toUTCString()
      : new Date().toUTCString();

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <managingEditor>${escapeXml(AUTHOR_EMAIL)} (${escapeXml(AUTHOR_NAME)})</managingEditor>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

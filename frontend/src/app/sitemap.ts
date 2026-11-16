import type { MetadataRoute } from "next";
import { fetchArticles } from "@/lib/api";
import { SITE_URL } from "@/lib/siteConfig";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchArticles();

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => {
    const dateStr = article.publishedAt ? article.publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
    return {
      url: `${SITE_URL}/blog/${encodeURIComponent(article.slug)}`,
      lastModified: new Date(`${dateStr}T00:00:00.000Z`),
      changeFrequency: "monthly",
      priority: 0.8,
    };
  });

  const firstDateStr = articles[0]?.publishedAt ? articles[0].publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(`${firstDateStr}T00:00:00.000Z`),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...articleEntries,
  ];
}

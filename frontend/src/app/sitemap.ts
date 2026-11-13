import type { MetadataRoute } from "next";
import { getCachedArticles } from "@/lib/articlesStore";
import { SITE_URL } from "@/lib/siteConfig";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getCachedArticles();

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/blog/${encodeURIComponent(article.slug)}`,
    lastModified: new Date(`${article.publishedAt}T00:00:00.000Z`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: articles[0]
        ? new Date(`${articles[0].publishedAt}T00:00:00.000Z`)
        : new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...articleEntries,
  ];
}

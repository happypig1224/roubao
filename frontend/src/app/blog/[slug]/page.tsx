import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailClient } from "@/components/ArticleDetailClient";
import { fetchArticleBySlug, fetchArticles } from "@/lib/api";

export async function generateStaticParams() {
  const articles = await fetchArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const article = await fetchArticleBySlug(decodedSlug);

  if (!article) {
    return {
      title: "文章未找到 | 肉包 (Roubao)",
    };
  }

  return {
    title: `${article.title} | 肉包 (Roubao)`,
    description: article.summary,
  };
}

export const instant = false;

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [article, articles] = await Promise.all([
    fetchArticleBySlug(decodedSlug),
    fetchArticles(),
  ]);

  if (!article) {
    notFound();
  }

  const currentIndex = articles.findIndex((a) => a.slug === decodedSlug);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex !== -1 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0c0d]" />}>
      <ArticleDetailClient
        key={article.slug}
        article={article}
        allArticles={articles}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
      />
    </React.Suspense>
  );
}

import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetailClient } from "@/components/ArticleDetailClient";
import {
  getCachedArticleBySlug,
  getCachedArticles,
} from "@/lib/articlesStore";

export async function generateStaticParams() {
  const articles = await getCachedArticles();
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
  const article = await getCachedArticleBySlug(decodedSlug);

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

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const articles = await getCachedArticles();
  const currentIndex = articles.findIndex((a) => a.slug === decodedSlug);

  if (currentIndex === -1) {
    notFound();
  }

  const article = articles[currentIndex];
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  return (
    <ArticleDetailClient
      key={article.slug}
      article={article}
      allArticles={articles}
      prevArticle={prevArticle}
      nextArticle={nextArticle}
    />
  );
}


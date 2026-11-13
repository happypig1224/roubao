"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Link2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDrawer } from "@/components/AdminDrawer";
import { ArticleToc } from "@/components/ArticleToc";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { extractTocHeadings } from "@/lib/markdown";
import { MOCK_PROJECTS } from "@/data/mockData";
import { Article } from "@/types";

interface ArticleDetailClientProps {
  article: Article;
  allArticles: Article[];
  prevArticle: Article | null;
  nextArticle: Article | null;
}

const CATEGORY_LABELS: Record<Article["category"], string> = {
  backend: "后端",
  architecture: "架构",
  frontend: "前端",
  performance: "调优",
};

export function ArticleDetailClient({
  article,
  allArticles,
  prevArticle,
  nextArticle,
}: ArticleDetailClientProps) {
  const router = useRouter();
  const [extraArticles, setExtraArticles] = useState<Article[]>([]);
  const [viewsOverride, setViewsOverride] = useState<{
    slug: string;
    views: number;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const trackedSlugRef = useRef<string | null>(null);

  const articles = React.useMemo(
    () => [
      ...extraArticles.filter(
        (extra) => !allArticles.some((base) => base.slug === extra.slug)
      ),
      ...allArticles,
    ],
    [extraArticles, allArticles]
  );

  const views =
    viewsOverride?.slug === article.slug ? viewsOverride.views : article.views;

  useEffect(() => {
    if (trackedSlugRef.current === article.slug) return;
    trackedSlugRef.current = article.slug;

    // 前端防抖与防刷：24 小时内同一浏览器对同一文章仅发起一次计数自增
    const STORAGE_KEY = `roubao_viewed_${article.slug}`;
    try {
      const lastViewed = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      if (lastViewed && now - Number(lastViewed) < 24 * 60 * 60 * 1000) {
        return;
      }
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch {
      // 忽略隐私模式或 localStorage 受限异常
    }

    fetch(`/api/articles/${encodeURIComponent(article.slug)}/views`, {
      method: "POST",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { views?: number } | null) => {
        if (data && typeof data.views === "number") {
          setViewsOverride({ slug: article.slug, views: data.views });
        }
      })
      .catch(() => {
        // 忽略瞬态网络异常
      });
  }, [article.slug]);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  const handleAddArticle = useCallback(
    (newArticle: Article) => {
      setExtraArticles((prev) => [newArticle, ...prev]);
      router.push(`/blog/${newArticle.slug}`);
      router.refresh();
    },
    [router]
  );

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  const headings = React.useMemo(
    () => extractTocHeadings(article.contentMarkdown),
    [article.contentMarkdown]
  );
  const showToc = headings.length >= 2;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0c0c0d] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <Navbar
        activeSection="blog"
        articles={articles}
        projects={MOCK_PROJECTS}
      />

      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 ${
          showToc ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/#blog"
            className="tactile-btn inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回文章列表</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyUrl}
            className="tactile-btn px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">已复制链接</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>分享链接</span>
              </>
            )}
          </button>
        </div>

        <div
          className={
            showToc
              ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-8 items-start"
              : ""
          }
        >
          <div className="min-w-0">
            {showToc && <ArticleToc headings={headings} variant="mobile" />}

            {/* Article Header + Body */}
            <article className="clean-card rounded-2xl p-6 sm:p-10">
              <header className="space-y-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-zinc-400 tabular-nums">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans font-medium">
                    {CATEGORY_LABELS[article.category]}
                  </span>
                  <span>{article.publishedAt}</span>
                  <span>•</span>
                  <span>{article.readTimeMinutes} 分钟阅读</span>
                  <span>•</span>
                  <span>{views} 次阅读</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug">
                  {article.title}
                </h1>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {article.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </header>

              <div className="pt-7">
                <MarkdownRenderer markdown={article.contentMarkdown} />
              </div>
            </article>

            {/* Prev / Next Navigation */}
            {(prevArticle || nextArticle) && (
              <nav
                aria-label="上下篇文章导航"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6"
              >
                {prevArticle ? (
                  <Link
                    href={`/blog/${prevArticle.slug}`}
                    className="clean-card rounded-xl p-4 group flex flex-col justify-between gap-1.5"
                  >
                    <span className="text-[11px] font-mono text-zinc-400 inline-flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" />
                      上一篇
                    </span>
                    <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {prevArticle.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextArticle && (
                  <Link
                    href={`/blog/${nextArticle.slug}`}
                    className="clean-card rounded-xl p-4 group flex flex-col justify-between items-end text-right gap-1.5"
                  >
                    <span className="text-[11px] font-mono text-zinc-400 inline-flex items-center gap-1">
                      下一篇
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {nextArticle.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          {showToc && <ArticleToc headings={headings} variant="desktop" />}
        </div>
      </main>

      <Footer />

      <AdminDrawer
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onAddArticle={handleAddArticle}
      />
    </div>
  );
}


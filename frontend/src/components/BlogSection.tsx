"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Rss, X } from "lucide-react";
import { Article } from "@/types";
import { triggerHaptic } from "@/lib/haptic";

interface BlogSectionProps {
  articles: Article[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORY_MAP: Record<string, string> = {
  all: "全部",
  backend: "后端",
  architecture: "架构",
  frontend: "前端",
  performance: "调优",
};

export function BlogSection({
  articles,
  selectedCategory,
  onCategoryChange,
}: BlogSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const hasDynamicArticles = articles.length > 0;

  const categories = [
    { key: "all", label: "全部" },
    { key: "backend", label: "后端" },
    { key: "architecture", label: "架构" },
    { key: "frontend", label: "前端" },
    { key: "performance", label: "调优" },
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: articles.length };
    for (const a of articles) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [articles]);

  const getCategoryCount = (key: string) => categoryCounts[key] ?? 0;

  const filteredArticles = articles.filter((art) => {
    const matchesCat = selectedCategory === "all" || art.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === "" ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <section
      id="blog"
      className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 border-t border-zinc-200/80 dark:border-zinc-800/80"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-1">
            Technical Journal
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            技术文章与博客
          </h2>
          <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            记录后端架构、JVM 虚拟线程实测与前端交互开发的心得
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800/60 transition-colors"
          >
            <Rss className="w-3 h-3 text-amber-500" />
            <span>RSS</span>
          </a>
        </div>
      </div>

      <div className="space-y-6">
        {/* 搜索与分类 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div role="tablist" aria-label="文章分类筛选" className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    onCategoryChange(c.key);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center tactile-depress ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="ml-1 text-[10px] font-mono opacity-60">
                    ({getCategoryCount(c.key)})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              aria-label="过滤技术文章"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文章..."
              className="w-full pl-9 pr-11 py-2.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="清除搜索关键词"
                onClick={() => setSearchQuery("")}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 文章流 */}
        {!hasDynamicArticles ? (
          <div className="py-12 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-xs sm:text-[13px] text-zinc-400 dark:text-zinc-500 font-mono">
              暂无已公开发布的技术文章
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-10 text-center text-zinc-400 dark:text-zinc-500 font-mono text-xs">
            未找到匹配文章
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <article key={article.id}>
                <Link
                  href={`/blog/${article.slug}`}
                  className="block apple-card rounded-2xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all select-none"
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                      {CATEGORY_MAP[article.category] || "文章"}
                    </span>
                    <time className="text-[11px] font-mono text-zinc-400 tabular-nums">
                      {article.publishedAt}
                    </time>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-1">
                    {article.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

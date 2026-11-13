"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Article } from "@/types";

interface BlogSectionProps {
  articles: Article[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function BlogSection({
  articles,
  selectedCategory,
  onCategoryChange,
}: BlogSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { key: "all", label: "全部" },
    { key: "backend", label: "后端" },
    { key: "architecture", label: "架构" },
    { key: "frontend", label: "前端" },
    { key: "performance", label: "调优" },
  ];

  const getCategoryCount = (key: string) =>
    key === "all" ? articles.length : articles.filter((a) => a.category === key).length;

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
      className="py-12 max-w-6xl mx-auto px-4 sm:px-6 border-t border-zinc-200 dark:border-zinc-800"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Rail */}
        <aside className="lg:col-span-4 lg:sticky lg:top-20 space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              技术文章
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              记录后端高并发踩坑、系统架构与前端工程细节
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文章..."
              aria-label="过滤技术文章"
              className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="清除搜索关键词"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label="文章分类筛选"
            className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0"
          >
            {categories.map((c) => {
              const active = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => onCategoryChange(c.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 flex items-center justify-between gap-2.5 ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <span>{c.label}</span>
                  <span
                    className={`font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded-full ${
                      active
                        ? "bg-white/20 dark:bg-black/20 text-white dark:text-zinc-950 font-semibold"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {getCategoryCount(c.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Article List: Open Clean Content Stream (No Giant Box Cage) */}
        <div className="lg:col-span-8">
          {filteredArticles.length === 0 ? (
            <div className="py-16 text-center text-xs font-mono text-zinc-400 clean-card rounded-2xl">
              暂无匹配文章
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="clean-card rounded-2xl p-5 sm:p-6 group block transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                      {article.title}
                    </h3>
                    <span className="text-xs font-mono text-zinc-400 shrink-0 tabular-nums">
                      {article.publishedAt}
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 mb-3.5">
                    {article.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono tabular-nums">
                    <span>{article.readTimeMinutes} 分钟</span>
                    <span>•</span>
                    <span>{article.views} 次阅读</span>
                    <span>•</span>
                    <div className="flex flex-wrap gap-1.5 font-sans">
                      {article.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

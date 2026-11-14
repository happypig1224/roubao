"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, X, Sparkles, BookOpen } from "lucide-react";
import { Article } from "@/types";

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
      /* HIG: 0.5px 发丝分割线与严密内容间距，彻底告别粗暴黑色边框 */
      className="py-14 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 border-t border-black/[0.06] dark:border-white/[0.08]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* =========================================================================
            左侧控制台/导航轨 (Left Filter Rail)
            HIG 布局：精准计算 85px 顶部避让，与全局粘滞导航保持绝对视觉平行
           ========================================================================= */}
        <aside className="lg:col-span-4 lg:sticky lg:top-[85px] space-y-5">
          {/* 标题与辅注（SF Pro 动态字阶：大标题 tight，小字 footnote 舒展） */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#0071e3] dark:text-[#2997ff] font-mono">
              Technical Journal
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.022em] text-[#1c1c1e] dark:text-[#f2f2f7]">
              技术文章
            </h2>
            <p className="text-[13px] leading-relaxed text-[#8e8e93] dark:text-[#a1a1a6]">
              记录高性能架构、虚拟线程并发陷阱与现代 Web 交互细节
            </p>
          </div>

          {/* -----------------------------------------------------------------------
              iOS 原生 SearchField 规范：
              1. 背景选用 Apple 标准搜索槽材质 rgba(118, 118, 128, 0.12)
              2. 44pt 触控预算：清空按钮通过伪元素扩增至 44x44pt 物理热区
             ----------------------------------------------------------------------- */}
          <div className="relative group">
            <Search className="w-4 h-4 text-[#8e8e93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-[#0071e3] dark:group-focus-within:text-[#2997ff]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文章标题、内容或标签..."
              aria-label="过滤技术文章"
              className="w-full pl-9 pr-11 py-2.5 text-[13px] sm:text-[14px] rounded-[12px] bg-[#767680]/12 dark:bg-[#767680]/24 border border-black/[0.03] dark:border-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7] placeholder:text-[#8e8e93] focus:outline-none focus:bg-white dark:focus:bg-[#1c1c1e] focus:ring-2 focus:ring-[#0071e3]/30 dark:focus:ring-[#2997ff]/40 transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="清除搜索关键词"
                /* HIG: hit-budget-44 确保移动端触控命中率 100% 达标 */
                className="absolute right-0 top-1/2 -translate-y-1/2 hit-budget-44 text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] cursor-pointer ios-pressable"
              >
                <span className="w-4 h-4 rounded-full bg-[#8e8e93]/30 dark:bg-[#8e8e93]/40 flex items-center justify-center">
                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                </span>
              </button>
            )}
          </div>

          {/* -----------------------------------------------------------------------
              iOS 经典分段胶囊控制舱 (Segmented Control Pill Bar)
              HIG 同心圆角公式：R_inner (12px) = R_outer (16px) - Padding (4px)
              手感：配合 active:scale-[0.972] 弹簧触感下陷，拒绝生硬切变
             ----------------------------------------------------------------------- */}
          <div
            role="tablist"
            aria-label="文章分类筛选"
            className="p-1 rounded-[16px] bg-[#767680]/12 dark:bg-[#767680]/20 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar select-none"
          >
            {categories.map((c) => {
              const active = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => onCategoryChange(c.key)}
                  style={{ minHeight: "44px" }}
                  /* HIG 同心圆角 rounded-[12px] + 移动端 44pt 触控保障 */
                  className={`relative min-h-[44px] h-[44px] px-3.5 py-2 rounded-[12px] text-[13px] font-semibold transition-all duration-200 cursor-pointer shrink-0 flex items-center justify-between gap-3 ios-pressable ${
                    active
                      ? "bg-white dark:bg-[#636366] text-[#1c1c1e] dark:text-[#f2f2f7] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.04] dark:border-white/10"
                      : "text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7] hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="tracking-tight">{c.label}</span>
                  {/* 等宽计数徽标 (tabular-nums 避免跳变) */}
                  <span
                    className={`font-mono text-[11px] tabular-nums px-2 py-0.5 rounded-full transition-colors ${
                      active
                        ? "bg-[#0071e3]/10 text-[#0071e3] dark:bg-white/20 dark:text-white font-bold"
                        : "bg-black/[0.04] dark:bg-white/[0.06] text-[#8e8e93]"
                    }`}
                  >
                    {getCategoryCount(c.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* =========================================================================
            右侧文章流 (Right Stream: Apple Inset Grouped Cards)
            HIG 空间深度：每张卡片具备天顶 1px 晶莹高光 + 多层柔和漫反射环境光
           ========================================================================= */}
        <div className="lg:col-span-8">
          {filteredArticles.length === 0 ? (
            /* Apple 风格纯净温润空状态 */
            <div className="apple-card rounded-[22px] py-16 px-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#767680]/10 dark:bg-[#767680]/20 flex items-center justify-center text-[#8e8e93]">
                <BookOpen className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <div className="text-[15px] font-semibold text-[#1c1c1e] dark:text-[#f2f2f7]">
                  未找到匹配文章
                </div>
                <p className="text-[13px] text-[#8e8e93]">
                  尝试更换关键词，或重置筛选分类
                </p>
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[12px] font-medium ios-pressable cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>清除关键词</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <article key={article.id}>
                  <Link
                    href={`/blog/${article.slug}`}
                    /* HIG: G2 连续超椭圆 (rounded-[22px]) + 天顶单边微高光 + 按压弹性微缩 */
                    className="apple-card rounded-[22px] p-6 sm:p-7 group block text-left ios-pressable select-none"
                  >
                    {/* 卡片头部：分类小胶囊 + 发布时间 */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.01em] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff]">
                        {CATEGORY_MAP[article.category] || "文章"}
                      </span>
                      <time className="text-[12px] font-mono tabular-nums text-[#8e8e93] tracking-[0.01em]">
                        {article.publishedAt}
                      </time>
                    </div>

                    {/* 文章大标题 (SF Pro Display Title 紧凑字距) */}
                    <h3 className="text-base sm:text-[18px] font-bold text-[#1c1c1e] dark:text-[#f2f2f7] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors tracking-[-0.018em] leading-snug mb-2">
                      {article.title}
                    </h3>

                    {/* 正文摘要 (Deference: 克制优雅，双行截断) */}
                    <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#3a3a3c] dark:text-[#a1a1a6] line-clamp-2 mb-4">
                      {article.summary}
                    </p>

                    {/* 底部元数据栏 (Hairline 分隔与等宽数字防抖) */}
                    <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#8e8e93] font-mono tabular-nums">
                      <div className="flex items-center gap-2">
                        <span>{article.readTimeMinutes} 分钟阅读</span>
                        <span className="text-[#8e8e93]/40">•</span>
                        <span>{article.views} 次浏览</span>
                      </div>

                      {/* 标签胶囊（Concentric 圆角适配，全圆角药丸） */}
                      <div className="flex flex-wrap items-center gap-1.5 font-sans">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#767680]/10 dark:bg-[#767680]/20 text-[#636366] dark:text-[#aeaeb2] tracking-[0.01em]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

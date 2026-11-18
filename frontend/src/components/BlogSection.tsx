"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Rss, ArrowUpRight, Clock, FileCode } from "lucide-react";
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
      className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 border-t border-black/[0.06] dark:border-white/[0.08]"
    >
      {hasDynamicArticles ? (
        /* 1. 存在已发布文章时的动态筛选与文章流 */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* 左侧控制台 */}
          <aside className="lg:col-span-4 lg:sticky lg:top-[86px] space-y-5">
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

            {/* 搜索框 */}
            <div className="relative group">
              <Search className="w-4 h-4 text-[#8e8e93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-[#0071e3] dark:group-focus-within:text-[#2997ff]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章标题、内容或标签..."
                aria-label="过滤技术文章"
                className="w-full pl-9 pr-11 min-h-[44px] py-2.5 text-[13px] sm:text-[14px] rounded-[12px] bg-[#767680]/12 dark:bg-[#767680]/24 border border-black/[0.03] dark:border-white/[0.06] text-[#1c1c1e] dark:text-[#f2f2f7] placeholder:text-[#8e8e93] focus:outline-none focus:bg-white dark:focus:bg-[#1c1c1e] focus:ring-2 focus:ring-[#0071e3]/30 dark:focus:ring-[#2997ff]/40 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8e8e93] hover:text-[#1c1c1e] dark:hover:text-[#f2f2f7]"
                >
                  清空
                </button>
              )}
            </div>

            {/* 分类列表 */}
            <div className="space-y-1.5">
              {categories.map((c) => {
                const isSelected = selectedCategory === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => onCategoryChange(c.key)}
                    className={`w-full min-h-[44px] px-3.5 rounded-[12px] flex items-center justify-between text-xs sm:text-[13px] transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#0071e3] text-white font-semibold shadow-xs"
                        : "text-[#1c1c1e] dark:text-[#f2f2f7] hover:bg-[#767680]/10 dark:hover:bg-[#767680]/20"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="font-mono text-[11px] opacity-70">
                      {getCategoryCount(c.key)}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 右侧文章列表 */}
          <div className="lg:col-span-8 min-h-[400px]">
            {filteredArticles.length === 0 ? (
              <div className="apple-card rounded-[22px] py-16 px-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#767680]/10 dark:bg-[#767680]/20 flex items-center justify-center text-[#8e8e93]">
                  <BookOpen className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <div className="text-[15px] font-semibold text-[#1c1c1e] dark:text-[#f2f2f7]">
                    未找到匹配文章
                  </div>
                  <p className="text-[13px] text-[#8e8e93]">
                    尝试更换搜索关键词，或切换筛选分类
                  </p>
                </div>
              </div>
            ) : (
              <div className="card-focus-group space-y-4">
                {filteredArticles.map((article) => (
                  <article key={article.id}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="group-card apple-card rounded-[22px] p-6 sm:p-7 group block text-left ios-pressable select-none hover:border-blue-500/40 dark:hover:border-blue-400/40 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff]">
                          {CATEGORY_MAP[article.category] || "文章"}
                        </span>
                        <time className="text-[12px] font-mono tabular-nums text-[#8e8e93]">
                          {article.publishedAt}
                        </time>
                      </div>

                      <h3 className="text-base sm:text-[18px] font-bold text-[#1c1c1e] dark:text-[#f2f2f7] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors tracking-tight leading-snug mb-2">
                        {article.title}
                      </h3>

                      <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#3a3a3c] dark:text-[#a1a1a6] line-clamp-2 mb-4">
                        {article.summary}
                      </p>

                      <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#8e8e93] font-mono tabular-nums">
                        <div className="flex items-center gap-2">
                          <span>{article.readTimeMinutes} 分钟阅读</span>
                          <span className="opacity-40">•</span>
                          <span>{article.views} 次浏览</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 font-sans">
                          {article.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#767680]/10 dark:bg-[#767680]/20 text-[#636366] dark:text-[#aeaeb2]"
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
      ) : (
        /* 2. 数据库文章为 0 时的杂志级技术专栏工坊 (Curated Editorial Space) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* 左侧专栏理念 */}
          <aside className="lg:col-span-4 lg:sticky lg:top-[86px] space-y-6">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#0071e3] dark:text-[#2997ff] font-mono">
                Technical Journal
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#1c1c1e] dark:text-[#f2f2f7]">
                技术文章与长文专栏
              </h2>
              <p className="text-xs sm:text-[14px] leading-relaxed text-[#8e8e93] dark:text-[#a1a1a6]">
                专注于单机极致吞吐、JVM 虚拟线程排坑心得与现代 Web 工匠级细节。拒绝无意义拼凑，每篇均附完整实测数据与复现代码。
              </p>
            </div>

            {/* 核心关注方向 */}
            <div className="p-4 rounded-[18px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                专栏核心选题方向
              </div>
              <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span><strong>后端高并发</strong> · 虚拟线程调度、锁竞争与连接池调优</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span><strong>架构设计</strong> · 短事务原则、对象存储与轻量化架构</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>工匠体验</strong> · Apple HIG 空间规范、连续曲率与弹簧手感</span>
                </div>
              </div>
            </div>

            {/* 订阅通道 */}
            <div className="pt-1">
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="tactile-btn min-h-[44px] w-full px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center justify-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-2xs transition-all"
              >
                <Rss className="w-4 h-4 text-amber-500" />
                <span>订阅技术文章 RSS (rss.xml)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </a>
            </div>
          </aside>

          {/* 右侧在撰文稿与专栏排期 */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  专栏排期与在撰文稿 (Upcoming Publications)
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                实时审校中
              </span>
            </div>

            {/* 文稿卡片 1 */}
            <div className="apple-card rounded-[22px] p-6 space-y-3 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all select-none">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 font-mono">
                  后端并发 · 调优实录
                </span>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-medium">
                  校对与数据复核中
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                《Java 21 虚拟线程生产避坑实录：载体线程固化 (Carrier Thread Pinning) 深度剖析》
              </h3>

              <p className="text-xs sm:text-[13.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                对比传统线程池与虚拟线程在单机高并发下的真实吞吐差异，复盘 synchronized 关键字导致底层 Carrier Thread 无法卸载（Pinning）的具体排障堆栈与 ReentrantLock 替代方案。
              </p>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>包含 k6 压测脚本 · JVM 诊断参数</span>
                </div>
                <span>约 3,200 字</span>
              </div>
            </div>

            {/* 文稿卡片 2 */}
            <div className="apple-card rounded-[22px] p-6 space-y-3 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all select-none">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50 font-mono">
                  架构演进 · 全栈工程
                </span>
                <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-medium">
                  排版整理中
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                《个人全栈网站的轻量化存储设计：为什么不建议用 MySQL 存 Markdown 长文？》
              </h3>

              <p className="text-xs sm:text-[13.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                从 InnoDB Buffer Pool 缓冲池命中率、单行溢出页开销与异地冷备恢复角度，深入解析“云对象存储 + CDN + Next.js 增量缓存”的现代化无状态架构实践。
              </p>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>附架构拓扑图 · 存储开销对比模型</span>
                </div>
                <span>约 2,800 字</span>
              </div>
            </div>

            {/* 文稿卡片 3 */}
            <div className="apple-card rounded-[22px] p-6 space-y-3 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all select-none">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 font-mono">
                  前端工匠 · Apple HIG
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  Demo 录制中
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                《浅谈现代 Web 界面的细节质感：同心圆角、漫反射阴影与物理触觉手感》
              </h3>

              <p className="text-xs sm:text-[13.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                基于 Apple Human Interface Guidelines 与现代微交互哲学，梳理同心圆角计算模型、天顶 1px 晶莹微高光、多层柔和漫反射环境阴影与 44pt 物理触控预算规范。
              </p>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>附微交互动效组件演示</span>
                </div>
                <span>约 2,500 字</span>
              </div>
            </div>

            {/* 底部温润说明 */}
            <p className="text-[11px] text-zinc-400 font-mono text-center pt-2">
              所有专栏长文均来自真实生产踩坑与实测经验。文章完成校对后将第一时间同步至 RSS 源与全站索引。
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

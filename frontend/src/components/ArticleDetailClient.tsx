"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Link2,
  PanelLeftOpen,
  ListTree,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDrawer } from "@/components/AdminDrawer";
import { ArticleToc } from "@/components/ArticleToc";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { extractTocHeadings, TocHeading } from "@/lib/markdown";
import { copyTextToClipboard } from "@/lib/utils";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const trackedSlugRef = useRef<string | null>(null);

  const sanitizedMarkdown = useMemo(() => {
    const raw = article.contentMarkdown || "";
    return raw.replace(/^#\s+[^\n]+(?:\r?\n)+/, "");
  }, [article.contentMarkdown]);

  const headings: TocHeading[] = useMemo(
    () => extractTocHeadings(sanitizedMarkdown),
    [sanitizedMarkdown]
  );
  const showToc = headings.length >= 2;
  const activeId = selectedId || headings[0]?.id || "";

  const articles = useMemo(
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

  // 1. 浏览量统计与防刷控制
  useEffect(() => {
    if (trackedSlugRef.current === article.slug) return;
    trackedSlugRef.current = article.slug;

    const controller = new AbortController();

    const STORAGE_KEY = `roubao_viewed_${article.slug}`;
    try {
      const lastViewed = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      if (lastViewed && now - Number(lastViewed) < 24 * 60 * 60 * 1000) {
        return;
      }
      localStorage.setItem(STORAGE_KEY, String(now));
    } catch {
      // 忽略隐私模式受限
    }

    fetch(`/api/v1/articles/${encodeURIComponent(article.slug)}/views`, {
      method: "POST",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { views?: number; code?: number } | null) => {
        if (data && typeof data.views === "number") {
          setViewsOverride({ slug: article.slug, views: data.views });
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          // 忽略常规网络瞬态错误
        }
      });

    return () => {
      controller.abort();
    };
  }, [article.slug]);

  // 2. 快捷键监听
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const isKeyA =
        e.key.toLowerCase() === "a" ||
        e.code === "KeyA" ||
        e.key.toLowerCase() === "keya";
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && isKeyA) {
        e.preventDefault();
        e.stopPropagation();
        setAdminOpen((prev) => !prev);
      }
    };
    const handleToggleAdmin = () => setAdminOpen((prev) => !prev);

    window.addEventListener("keydown", handleGlobalKey);
    window.addEventListener("roubao:toggle-admin", handleToggleAdmin);
    return () => {
      window.removeEventListener("keydown", handleGlobalKey);
      window.removeEventListener("roubao:toggle-admin", handleToggleAdmin);
    };
  }, []);

  // 3. 滚动追踪目录当前高亮小节
  useEffect(() => {
    if (headings.length === 0) return;

    const headingEls = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headingEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target.id) {
          setSelectedId(visible.target.id);
        }
      },
      {
        rootMargin: "-90px 0px -70% 0px",
        threshold: 0,
      }
    );

    for (const el of headingEls) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  const handleJump = useCallback((id: string) => {
    setSelectedId(id);
    setMobileTocOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }
  }, []);

  const handleAddArticle = useCallback(
    (newArticle: Article) => {
      setExtraArticles((prev) => [newArticle, ...prev]);
      router.push(`/blog/${newArticle.slug}`);
      router.refresh();
    },
    [router]
  );

  const handleCopyUrl = async () => {
    const success = await copyTextToClipboard(window.location.href);
    if (!success) return;
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0c0c0d] text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <Navbar
        activeSection="blog"
        articles={articles}
        projects={MOCK_PROJECTS}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12">
        {/* 移动端展开目录下拉层 */}
        {showToc && mobileTocOpen && (
          <div className="lg:hidden mb-4 clean-card rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 max-h-80 overflow-y-auto no-scrollbar shadow-md">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span>文章小节速览</span>
              <span className="font-mono text-zinc-400">{headings.length} 节</span>
            </div>
            <nav className="space-y-1">
              {headings.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleJump(item.id);
                  }}
                  className={`block py-1 text-xs leading-snug rounded px-2 ${
                    activeId === item.id
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* 主内容区: 左侧大纲从零点完全锚定 (零位移无跳变) + 右侧流式正文主画布 */}
        <div className="flex items-start relative">
          {/* 左侧栏目录 (桌面端): 精准锚定在 sticky top-[86px]，与首屏 pt-5 (20px) 保持 100% 绝对零位移 (0.000px 差值) */}
          {showToc && (
            <div
              className={`hidden lg:block shrink-0 sticky top-[86px] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                sidebarCollapsed
                  ? "w-0 opacity-0 -translate-x-4 pointer-events-none mr-0"
                  : "w-72 xl:w-80 opacity-100 translate-x-0 mr-8"
              }`}
            >
              <div className="w-72 xl:w-80 shrink-0">
                <ArticleToc
                  headings={headings}
                  activeId={activeId}
                  onSelectHeading={handleJump}
                  onToggleCollapse={() => setSidebarCollapsed(true)}
                />
              </div>
            </div>
          )}

          {/* 仿飞书左侧吸附式大纲展开图标按钮 (精准同步 top-[86px]，固定尺寸 w-9 h-9，悬停纯浮动 Tooltip，绝不改变宽度推挤正文) */}
          {showToc && (
            <div
              className={`hidden lg:block sticky top-[86px] z-20 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                sidebarCollapsed
                  ? "w-9 mr-4 opacity-100 pointer-events-auto"
                  : "w-0 mr-0 opacity-0 pointer-events-none overflow-hidden"
              }`}
            >
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                aria-label="展开目录"
                className="relative group flex items-center justify-center w-9 h-9 rounded-xl bg-white/95 dark:bg-[#141416]/95 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm hover:shadow-md backdrop-blur-md text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-150 cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4 transition-transform group-hover:scale-110" />

                {/* 仿飞书绝对定位悬浮气泡提示 (绝不占用文档流，绝不推挤正文布局) */}
                <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 text-[11px] font-medium bg-zinc-900/95 text-zinc-100 dark:bg-zinc-100/95 dark:text-zinc-900 px-2.5 py-1 rounded-md shadow-lg">
                  展开目录 ({headings.length})
                </div>
              </button>
            </div>
          )}

          {/* 右侧文章主体内容: 占据剩余全部宽度 (展开时约 4/5，折叠时 100% 全宽自动伸缩平滑过渡) */}
          <div className="flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <article className="apple-card rounded-[24px] p-6 sm:p-10 lg:p-14">
              <div className="max-w-3xl">
                <header className="space-y-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-zinc-400 tabular-nums">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans font-medium">
                        {CATEGORY_LABELS[article.category] || "技术"}
                      </span>
                      <span>{article.publishedAt}</span>
                      <span>•</span>
                      <span>{article.readTimeMinutes} 分钟阅读</span>
                      <span>•</span>
                      <span>{views} 次阅读</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 移动端目录折叠抽屉开关 */}
                      {showToc && (
                        <button
                          type="button"
                          onClick={() => setMobileTocOpen((prev) => !prev)}
                          className="lg:hidden inline-flex tactile-btn items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          <ListTree className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>目录 ({headings.length})</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                              mobileTocOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}

                      {/* 快速返回列表 (移动端或桌面端大纲收起时提供快速回溯) */}
                      {(sidebarCollapsed || !showToc) && (
                        <Link
                          href="/#blog"
                          className="tactile-btn inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 py-1 px-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
                          <span>返回列表</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="tactile-btn px-2.5 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 cursor-pointer shadow-2xs"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">已复制</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                            <span>分享</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-snug">
                    {article.title}
                  </h1>

                  <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
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

                {/* 正文 Markdown 高精渲染容器 (Optimal 65-75ch Reading Ergonomics) */}
                <div className="pt-7">
                  <MarkdownRenderer markdown={article.contentMarkdown || ""} />
                </div>
              </div>
            </article>

            {/* 上下一篇文章导航卡片 */}
            {(prevArticle || nextArticle) && (
              <nav
                aria-label="上下篇文章导航"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8"
              >
                {prevArticle ? (
                  <Link
                    href={`/blog/${prevArticle.slug}`}
                    className="clean-card rounded-xl p-5 group flex flex-col justify-between gap-2 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
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
                    className="clean-card rounded-xl p-5 group flex flex-col justify-between items-end text-right gap-2 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
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

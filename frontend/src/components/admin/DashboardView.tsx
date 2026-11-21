"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle2,
  FileEdit,
  Boxes,
  Eye,
  Heart,
  RefreshCw,
  Plus,
  Upload,
  ArrowUpRight,
  FolderTree,
} from "lucide-react";
import { DashboardStats } from "@/types";
import { fetchDashboardStats } from "@/lib/adminApi";
import { AdminTab } from "./AdminNavbar";

interface DashboardViewProps {
  token: string;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenArticleEditor: () => void;
  onOpenMarkdownUpload: () => void;
}

/**
 * 后台大盘总览与核心指标大屏
 *
 * @author roubao
 * @since 2026-11-16
 */
export function DashboardView({
  token,
  onNavigateTab,
  onOpenArticleEditor,
  onOpenMarkdownUpload,
}: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchDashboardStats(token);
      setStats(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "拉取统计指标失败";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const data = await fetchDashboardStats(token);
        if (isMounted) setStats(data);
      } catch (err: unknown) {
        if (isMounted) setErrorMsg(err instanceof Error ? err.message : "拉取统计指标失败");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Title Bar & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            系统大盘总览
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            汇总全站文章浏览、发布状态与各分类数据
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>刷新数据</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* 6 Core Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          title="总博文数"
          value={stats?.totalArticles ?? (isLoading ? "..." : 0)}
          icon={FileText}
          accent="blue"
        />
        <MetricCard
          title="已发布上线"
          value={stats?.publishedArticles ?? (isLoading ? "..." : 0)}
          icon={CheckCircle2}
          accent="emerald"
        />
        <MetricCard
          title="草稿箱"
          value={stats?.draftArticles ?? (isLoading ? "..." : 0)}
          icon={FileEdit}
          accent="amber"
        />
        <MetricCard
          title="开源展厅"
          value={stats?.totalProjects ?? (isLoading ? "..." : 0)}
          icon={Boxes}
          accent="purple"
        />
        <MetricCard
          title="全站总浏览"
          value={stats?.totalViews ?? (isLoading ? "..." : 0)}
          icon={Eye}
          accent="cyan"
        />
        <MetricCard
          title="全站总获赞"
          value={stats?.totalLikes ?? (isLoading ? "..." : 0)}
          icon={Heart}
          accent="rose"
        />
      </div>

      {/* Quick Action Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          快捷管理操作
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenArticleEditor}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">撰写新博文</p>
                <p className="text-[10px] text-zinc-400">富文本与 Markdown</p>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
          </button>

          <button
            onClick={onOpenMarkdownUpload}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">导入 Markdown</p>
                <p className="text-[10px] text-zinc-400">解析 Frontmatter</p>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
          </button>

          <button
            onClick={() => onNavigateTab("categories")}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FolderTree className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">分类体系管理</p>
                <p className="text-[10px] text-zinc-400">查看与维护分类</p>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
          </button>

          <button
            onClick={() => onNavigateTab("projects")}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">开源展厅管理</p>
                <p className="text-[10px] text-zinc-400">维护精选项目</p>
              </div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
          </button>
        </div>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              分类体系与文章内容分布
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              各专业领域文章数量与占比概览
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("categories")}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            管理分类 →
          </button>
        </div>

        {stats?.categoryStats && stats.categoryStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {stats.categoryStats.map((cat) => {
              const total = stats.totalArticles || 1;
              const percent = Math.round(((cat.articleCount || 0) / total) * 100);
              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {cat.categoryName}
                      </span>
                      <code className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                        /{cat.categorySlug}
                      </code>
                    </div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {cat.articleCount} 篇 ({percent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, percent)}%` }}
                    />
                  </div>

                  {cat.description && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-zinc-400">
            暂无分类分布数据
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "blue" | "emerald" | "amber" | "purple" | "cyan" | "rose";
}) {
  const accentStyles = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-900/40",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/40",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/40",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-900/40",
    cyan: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/60 dark:border-cyan-900/40",
    rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/40",
  }[accent];

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {title}
        </span>
        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${accentStyles}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
        {value}
      </div>
    </div>
  );
}

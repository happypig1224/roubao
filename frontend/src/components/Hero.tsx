"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Clock,
  Cpu,
  Database,
  FileText,
  Layers,
  Mail,
  MapPin,
  Server,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { GithubIcon } from "./icons";
import { BaoCoreLogo } from "./BaoCoreLogo";
import { AUTHOR_EMAIL, GITHUB_URL } from "@/lib/siteConfig";
import { copyTextToClipboard } from "@/lib/utils";
import { Article, Project } from "@/types";

interface HeroProps {
  onOpenResume: () => void;
  hasArticles?: boolean;
  featuredProject?: Project | null;
  featuredArticle?: Article | null;
}

const emptySubscribe = () => () => {};
function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function Hero({
  onOpenResume,
  hasArticles = false,
  featuredProject = null,
  featuredArticle = null,
}: HeroProps) {
  const mounted = useIsMounted();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<"stack" | "manifesto">("stack");
  const [timeStr, setTimeStr] = useState<string>("14:00:00");

  useEffect(() => {
    const updateClock = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("zh-CN", {
          timeZone: "Asia/Shanghai",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        setTimeStr(formatter.format(now));
      } catch {
        // fallback
      }
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const success = await copyTextToClipboard(AUTHOR_EMAIL);
    if (!success) return;
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1800);
  };

  const pillars = [
    {
      icon: Cpu,
      title: "高并发服务架构",
      detail: "Java 21 虚拟线程 · Netty · 短事务隔离",
    },
    {
      icon: Database,
      title: "可观测与存储设计",
      detail: "ClickHouse 列式压缩 · Redis 7 Lua 限流",
    },
    {
      icon: Layers,
      title: "现代 Web 工程",
      detail: "Next.js · React 19 · TypeScript",
    },
  ];

  return (
    <section
      id="top"
      className="pt-10 pb-12 sm:pt-16 sm:pb-16 max-w-6xl mx-auto px-4 sm:px-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Stage: 个人简介与技术定位 */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6 sm:gap-7">
          <div className="space-y-5">
            {/* 状态徽章 */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 font-medium">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                中国 · 杭州
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                开放架构与全栈交流
              </span>
            </div>

            {/* 名字与核心标题 */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
                肉包 <span className="text-zinc-400 dark:text-zinc-600 font-normal text-2xl sm:text-3xl font-mono">/ Roubao</span>
              </h1>
              <p className="text-base sm:text-lg font-medium text-zinc-600 dark:text-zinc-300 mt-2 tracking-tight">
                全栈软件工程师 · 专注于高性能后端架构与现代 Web 开发
              </p>
            </div>

            {/* 个人陈述 */}
            <div className="max-w-[62ch] text-[14px] sm:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-3">
              <p>
                你好，我是肉包。平时主要深耕{" "}
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  Java 21 / Spring Boot
                </strong>{" "}
                后端高并发架构与{" "}
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  Next.js / React
                </strong>{" "}
                工匠级现代前端工程。
              </p>
              <p>
                技术上追求清晰的模块边界、短事务设计与单机极致吞吐，避免无意义的过度设计。在高性能高并发、分布式可观测与工匠级前端体验中持续深耕沉淀。
              </p>
            </div>

            {/* 触控操作栏 (Strict Apple HIG 44pt Touch Targets) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenResume}
                className="tactile-btn min-h-[44px] px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 inline-flex items-center gap-2 text-xs sm:text-[13px] font-semibold cursor-pointer shadow-md transition-all active:scale-[0.97]"
              >
                <FileText className="w-4 h-4" />
                <span>查看与下载简历 (PDF)</span>
              </button>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="tactile-btn min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-2xs transition-all active:scale-[0.97]"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </a>

              <a
                href={`mailto:${AUTHOR_EMAIL}`}
                onClick={handleCopyEmail}
                title={`点击复制邮箱 ${AUTHOR_EMAIL}`}
                className="tactile-btn min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-2xs transition-all active:scale-[0.97]"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">已复制邮箱</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <span>Email</span>
                  </>
                )}
              </a>

              {hasArticles && (
                <a
                  href="#blog"
                  className="tactile-btn min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-2xs transition-all active:scale-[0.97]"
                >
                  <span>技术文章</span>
                  <ArrowDownRight className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              )}
            </div>
          </div>

          {/* 核心技术专长 (3 Pillars) */}
          <div className="pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 font-semibold">
              核心技术专长 / Capabilities
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {pillar.title}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-mono">
                      {pillar.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Stage: 开发者数字工坊与技术控制台 (Balanced & High Craft) */}
        <div className="lg:col-span-5">
          {featuredProject ? (
            /* 存在真实精选项目时的展示 */
            <div className="apple-card rounded-[24px] p-6 space-y-5 select-none">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/90 dark:border-zinc-700/60 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden p-1">
                    <BaoCoreLogo className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {featuredProject.name}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {featuredProject.tagline}
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  FEATURED
                </span>
              </div>
              <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                {featuredProject.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {featuredProject.techTags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {featuredArticle ? (
                  <Link
                    href={`/blog/${featuredArticle.slug}`}
                    className="min-h-[44px] inline-flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="line-clamp-1">阅读《{featuredArticle.title}》</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  </Link>
                ) : (
                  <a
                    href={featuredProject.repoUrl || "#projects"}
                    target={featuredProject.repoUrl ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>查看项目仓库</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                  </a>
                )}
                <a
                  href="#projects"
                  className="min-h-[44px] inline-flex items-center text-xs font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  全部项目 ↓
                </a>
              </div>
            </div>
          ) : (
            /* 开发者数字工坊与技术控制台 (Roubao Engineering Workbench) */
            <div className="apple-card rounded-[24px] p-5 sm:p-6 space-y-4 select-none relative overflow-hidden">
              {/* 顶部控制台标题与实时时钟 */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-2xs">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
                      <span>数字工坊 · 技术看板</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">v2.4</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      ROUBAO ENGINEERING HUD
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 tabular-nums">
                  <Clock className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>{mounted ? timeStr : "14:00:00"}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">CST (UTC+8)</span>
                </div>
              </div>

              {/* 交互选项卡: 技术矩阵 vs 工程准则 */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  System View
                </span>
                <div className="inline-flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("stack")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      activeTab === "stack"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    技术栈矩阵
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("manifesto")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      activeTab === "manifesto"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    架构宣言
                  </button>
                </div>
              </div>

              {/* Tab 1: 技术栈矩阵 */}
              {activeTab === "stack" && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px] uppercase">
                        <Server className="w-3 h-3 text-blue-500" />
                        <span>后端运行时</span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Java 21 · Spring Boot 3
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Virtual Threads · Netty
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px] uppercase">
                        <Database className="w-3 h-3 text-purple-500" />
                        <span>存储与中间件</span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        MySQL 8 · Redis 7
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        ClickHouse · Lua 限流
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px] uppercase">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>现代前端工程</span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Next.js 16 · React 19
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        TypeScript · Tailwind v4
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px] uppercase">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>交互与工效</span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Apple HIG · 连续曲率
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        44pt 触控 · 物理弹簧
                      </div>
                    </div>
                  </div>

                  {/* 状态度量卡 */}
                  <div className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      架构设计目标
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                      清晰边界 · 短事务隔离 · 单机高吞吐
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: 架构宣言代码 */}
              {activeTab === "manifesto" && (
                <div className="pt-1">
                  <pre className="p-3.5 rounded-xl bg-zinc-900 dark:bg-black border border-zinc-800 text-zinc-200 text-[11px] font-mono leading-relaxed overflow-x-auto">
                    <code>{`public final class ArchitectureManifesto {
  // 1. 坚持清晰的模块边界与分层防腐
  // 2. 短事务设计，杜绝在事务内发起长网络 I/O
  // 3. 避免无意义的过度设计与过早分布式
  public static final String PRINCIPLE = 
    "高内聚 · 极简低延迟 · 真实单机性能沉淀";
}`}</code>
                  </pre>
                </div>
              )}

              {/* 底部引导栏 */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="text-[11px] font-mono text-zinc-400">
                  工匠级界面质感 · 零虚假数据
                </span>
                <a
                  href="#projects"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <span>查看在研工坊</span>
                  <ArrowDownRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

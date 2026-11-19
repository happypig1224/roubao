"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Cpu,
  Database,
  FileText,
  Layers,
  Mail,
  MapPin,
} from "lucide-react";
import { GithubIcon } from "./icons";
import { AUTHOR_EMAIL, GITHUB_URL } from "@/lib/siteConfig";
import { copyTextToClipboard } from "@/lib/utils";
import { Article, Project } from "@/types";

interface HeroProps {
  onOpenResume: () => void;
  hasArticles?: boolean;
  featuredProject?: Project | null;
  featuredArticle?: Article | null;
}

export function Hero({
  onOpenResume,
  hasArticles = false,
  featuredProject = null,
  featuredArticle = null,
}: HeroProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

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
      className="pt-12 pb-14 sm:pt-18 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6"
    >
      <div className="flex flex-col gap-8">
        {/* 个人简介核心信息 */}
        <div className="space-y-6">
          {/* 状态与地理位置徽章 */}
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

          {/* 名字与核心技术定位 */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
              肉包 <span className="text-zinc-400 dark:text-zinc-600 font-normal text-2xl sm:text-3xl font-mono">/ Roubao</span>
            </h1>
            <p className="text-base sm:text-lg font-medium text-zinc-600 dark:text-zinc-300 mt-2.5 tracking-tight">
              全栈软件工程师 · 专注于高性能后端架构与现代 Web 开发
            </p>
          </div>

          {/* 真实个人陈述 */}
          <div className="max-w-[68ch] text-[14px] sm:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-3">
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

          {/* 操作触点栏 (Strict Apple HIG 44pt Touch Targets) */}
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

        {/* 核心技术专长 (Capabilities 3 Pillars) */}
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
                  className="p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
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

        {/* 仅在数据库有真实精选项目时展示 */}
        {featuredProject && (
          <div className="apple-card rounded-[24px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {featuredProject.name}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">精选项目</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              {featuredProject.description}
            </p>
            {featuredArticle && (
              <Link
                href={`/blog/${featuredArticle.slug}`}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <span>阅读相关技术文章</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

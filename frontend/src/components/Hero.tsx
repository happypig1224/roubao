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
      className="pt-12 pb-12 sm:pt-16 sm:pb-16 max-w-6xl mx-auto px-4 sm:px-6"
    >
      <div
        className={
          featuredProject
            ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            : "max-w-4xl space-y-8"
        }
      >
        {/* Left Stage: 个人简介 (Personal Profile & Bio) */}
        <div
          className={
            featuredProject
              ? "lg:col-span-7 flex flex-col justify-between gap-7"
              : "flex flex-col gap-7"
          }
        >
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  肉包
                </h1>
                <p className="text-sm sm:text-base font-medium text-zinc-500 dark:text-zinc-400 mt-1.5">
                  全栈软件工程师 · 专注于高性能后端架构与现代 Web 开发
                </p>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 mt-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    中国 · 杭州
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    开放架构与全栈交流
                  </span>
                </div>
              </div>
            </div>

            <div className="max-w-[62ch] text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-3.5 mb-7">
              <p>
                你好，我是肉包。平时主要深耕{" "}
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  Java 21 / Spring Boot
                </strong>{" "}
                后端架构与{" "}
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  Next.js / React
                </strong>{" "}
                现代前端工程。
              </p>
              <p>
                技术上追求清晰的模块边界、短事务设计与单机极致吞吐，避免无意义的过度设计。在高性能高并发、分布式可观测与工匠级前端体验中持续深耕沉淀。
              </p>
            </div>

            {/* Clean Minimal Action Row (Strict HIG 44pt Touch Targets) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onOpenResume}
                className="tactile-btn min-h-[44px] px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>查看与下载简历 (PDF)</span>
              </button>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="tactile-btn min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </a>

              <a
                href={`mailto:${AUTHOR_EMAIL}`}
                onClick={handleCopyEmail}
                title={`点击复制邮箱 ${AUTHOR_EMAIL}`}
                className="tactile-btn min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">已复制邮箱</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Email</span>
                  </>
                )}
              </a>

              {hasArticles && (
                <a
                  href="#blog"
                  className="tactile-btn min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                >
                  <span>技术文章</span>
                  <ArrowDownRight className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              )}
            </div>
          </div>

          {/* 3-Pillar Engineered Capabilities Strip */}
          <div className="pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              核心技术专长 / Capabilities
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
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

        {/* Right Stage: 仅在存在真实精选项目时动态渲染 */}
        {featuredProject && (
          <div className="lg:col-span-5">
            <div className="apple-card rounded-[24px] p-5 sm:p-6 space-y-5 select-none">
              {/* Top Bar */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
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

              {/* Description */}
              <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                {featuredProject.description}
              </p>

              {/* Tech Tags */}
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

              {/* Bottom Row */}
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
          </div>
        )}
      </div>
    </section>
  );
}

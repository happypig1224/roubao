"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  FileText,
  GraduationCap,
  Mail,
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

  return (
    <section
      id="top"
      className="scroll-mt-28 md:scroll-mt-20 pt-8 pb-14 sm:pt-14 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6"
    >
      <div className="flex flex-col gap-8">
        {/* 1. 顶部身份与状态徽章 */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
              2027届全日制本科 · 计算机科学与技术
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              开放实习交流 · 后端开发 & AI 工程化
            </span>
          </div>

          {/* 姓名与核心介绍 */}
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
                苦恼的肉包🍔
              </h1>
            </div>
            <p className="text-base sm:text-lg font-medium text-zinc-600 dark:text-zinc-300 mt-2 tracking-tight">
              我一直在努力成为更好的自己 · Java 后端开发工程师
            </p>
          </div>

          {/* 个人陈述 (精炼克制，规范呈现) */}
          <div className="max-w-[68ch] text-[14px] sm:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-2.5">
            <p>
              你好，我是苦恼的肉包🍔。目前是{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                2027届全日制本科计算机科学与技术专业
              </strong>
              在读，专注{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                后端开发
              </strong>{" "}
              与{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                大模型工程化落地
              </strong>
              。
            </p>
            <p>
              工程上推崇{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                Specs Coding（SDD 规范驱动 / TDD 测试驱动）
              </strong>
              开发模式，熟练运用{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                Claude Code、Gemini
              </strong>{" "}
              等 AI 辅助编程工具提升研发效能与工程质量。
            </p>
          </div>

          {/* 关键操作触点栏 */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onOpenResume}
              className="tactile-btn min-h-[42px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-2xs transition-all active:scale-[0.97] cursor-pointer"
            >
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>工程履历 / 简历</span>
            </button>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="tactile-btn min-h-[42px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-2xs transition-all active:scale-[0.97]"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </a>

            <a
              href={`mailto:${AUTHOR_EMAIL}`}
              onClick={handleCopyEmail}
              title={`点击复制邮箱 ${AUTHOR_EMAIL}`}
              className="tactile-btn min-h-[42px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-2xs transition-all active:scale-[0.97]"
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
                className="tactile-btn min-h-[42px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-2xs transition-all active:scale-[0.97]"
              >
                <span>技术文章</span>
                <ArrowDownRight className="w-3.5 h-3.5 text-zinc-400" />
              </a>
            )}
          </div>
        </div>

        {/* 2. 精选项目展示 (仅在数据库有真实精选项目时展示) */}
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

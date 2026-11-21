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
  GraduationCap,
  Sparkles,
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

  const pillars = [
    {
      icon: Cpu,
      title: "Java 后端与微服务",
      detail: "Java 21 · Spring Boot 3 · Spring Cloud Alibaba · RocketMQ",
    },
    {
      icon: Sparkles,
      title: "AI 工程化与大模型",
      detail: "Spring AI Alibaba · RAG 混合检索 · Agent 架构 · 降低幻觉",
    },
    {
      icon: Database,
      title: "存储中间件与调优",
      detail: "MySQL 8 慢SQL优化 · Redis 7 缓存架构 · Redisson 分布式锁",
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
          {/* 状态与院校专业徽章 */}
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
              开放实习交流 · Java 后端 & AI 工程化
            </span>
          </div>

          {/* 名字与核心简介 */}
          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
                苦恼的肉包🍔
              </h1>
              <span className="text-base sm:text-lg font-mono text-zinc-500 dark:text-zinc-400">
                (Roubao)
              </span>
            </div>
            <p className="text-base sm:text-lg font-medium text-zinc-600 dark:text-zinc-300 mt-2.5 tracking-tight">
              我一直在努力成为更好的自己 · Java 后端开发工程师
            </p>
          </div>

          {/* 真实个人陈述 */}
          <div className="max-w-[68ch] text-[14px] sm:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-3">
            <p>
              你好，我是苦恼的肉包🍔（Roubao）。目前是{" "}
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
              熟练掌握 <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Spring 全家桶（Spring Boot、SpringMVC）</strong>与 <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">MyBatis</strong> 系列框架，掌握 Bean 生命周期、IoC/AOP 底层实现、事务传播机制及自动装配原理，熟悉 <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Spring Cloud Alibaba</strong> 微服务体系；掌握 Java 核心技术，深入理解 HashMap、ConcurrentHashMap 等集合底层源码与虚拟线程，掌握 JVM 内存模型、双亲委派机制与 GC 算法（CMS/G1），扎实掌握 JUC 并发底层原理（AQS、CAS、锁机制与线程池调优），熟练运用 CompletableFuture 进行异步编排。
            </p>
            <p>
              深入理解 <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">MySQL</strong> InnoDB 引擎与 B+ 树索引，具备慢 SQL 分析与执行计划调优能力；掌握 <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Redis</strong> 缓存架构设计（穿透/击穿/雪崩治理）与 Redisson 分布式锁，掌握 <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">RocketMQ</strong> 消息模型及消息可靠性排查。熟练使用 <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Spring AI Alibaba / LangChain</strong>，熟悉 RAG 全链路优化（混合检索 BM25+Vector、重排序及元数据过滤），具备 LLM 推理加速与滑动窗口实践；工程上推崇 <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">Specs Coding（SDD 规范驱动 / TDD 测试驱动）</strong>开发模式，熟练运用 Claude Code、Gemini 等 AI 辅助编程工具提升研发效能与工程质量。
            </p>
          </div>

          {/* 操作触点栏 */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenResume}
              className="tactile-btn min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-2xs transition-all active:scale-[0.97] cursor-pointer"
            >
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>工程履历 / 简历</span>
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

        {/* 核心技术沉淀 */}
        <div className="pt-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 font-semibold">
            技术方向与实践
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
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

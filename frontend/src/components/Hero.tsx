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
  Layers,
  Mail,
  Terminal,
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

  const skillDomains = [
    {
      icon: Cpu,
      title: "Java 核心与并发底层",
      level: "扎实掌握",
      badgeColor: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40",
      dotColor: "bg-blue-500",
      tags: ["JUC 并发", "AQS / CAS", "虚拟线程", "JVM 调优", "CompletableFuture"],
      points: [
        "深入理解 ArrayList、HashMap、ConcurrentHashMap 等集合底层源码，掌握反射、动态代理与虚拟线程，熟练运用 Lambda、Stream API 函数式编程",
        "深入 JVM 内存结构、类加载机制与双亲委派模型，熟悉常见垃圾回收算法及 CMS、G1 垃圾回收器",
        "扎实掌握 synchronized、ReentrantLock、CAS、AQS、ThreadLocal、volatile 等底层原理与线程池调优，熟练运用 CompletableFuture 进行异步编排优化接口响应",
      ],
    },
    {
      icon: Layers,
      title: "框架与微服务生态",
      level: "熟练掌握",
      badgeColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40",
      dotColor: "bg-emerald-500",
      tags: ["Spring Boot 3", "SpringMVC", "MyBatis-Plus", "Spring Cloud Alibaba", "Dubbo"],
      points: [
        "熟练掌握 Spring 全家桶（Spring、SpringMVC、SpringBoot）与 MyBatis 系列框架，具备快速构建和部署生产级应用能力",
        "深入掌握 Bean 生命周期、IoC/AOP 底层实现、事务传播机制与失效场景、Spring Boot 自动装配原理",
        "熟悉 Spring Cloud Alibaba 微服务体系（Nacos、Feign、Gateway、Sentinel）及 Dubbo + Zookeeper 服务治理",
      ],
    },
    {
      icon: Database,
      title: "数据存储与中间件治理",
      level: "深入理解",
      badgeColor: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200/60 dark:border-violet-800/40",
      dotColor: "bg-violet-500",
      tags: ["MySQL 8", "InnoDB", "Redis 7", "Redisson", "RocketMQ"],
      points: [
        "深入理解 B+ 树索引底层与 InnoDB 存储引擎、事务原理，具备慢 SQL 排查与执行计划调优能力，熟悉主从复制与读写分离架构",
        "掌握 Redis 核心结构、持久化策略、内存淘汰与哨兵集群，具备缓存穿透/击穿/雪崩治理及 Redisson 分布式锁实战经验",
        "掌握 RocketMQ 消息模型，具备消息丢失、重复消费、消息堆积、顺序消费等线上问题的排查处理能力",
      ],
    },
    {
      icon: Sparkles,
      title: "AI 工程化与大模型应用",
      level: "熟练使用",
      badgeColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40",
      dotColor: "bg-amber-500",
      tags: ["Spring AI Alibaba", "LangChain", "RAG 混合检索", "重排序", "滑动窗口"],
      points: [
        "LLM 工程架构：熟悉 RAG（检索增强生成）全链路优化，熟练使用 Spring AI Alibaba / LangChain，掌握混合检索（BM25+Vector）、重排序及元数据过滤，有效解决幻觉与检索不精准",
        "性能与延迟优化：具备 LLM 推理加速实战经验，通过并行上下文组装、流式输出及懒加载降低首字延迟；熟悉 Token 感知滑动窗口算法，动态管理上下文以降低成本",
      ],
    },
    {
      icon: Terminal,
      title: "前端联调与 DevOps 工程化",
      level: "熟悉掌握",
      badgeColor: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/60 dark:border-zinc-700/60",
      dotColor: "bg-zinc-500",
      colSpan: "md:col-span-2",
      tags: ["Vue3", "TypeScript", "Docker", "Linux", "JMeter", "Git", "Maven"],
      points: [
        "前端技术栈：熟悉 HTML5、CSS3、JavaScript、Vue3、Axios、Ajax，具备前后端联调与接口排障调试能力",
        "DevOps 工具链：熟悉 Git、Maven、Linux 常用命令、Docker 容器化部署、JMeter 压力测试与 Postman 接口测试",
      ],
    },
  ];

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
              <span className="text-base sm:text-lg font-mono text-zinc-500 dark:text-zinc-400">
                (Roubao)
              </span>
            </div>
            <p className="text-base sm:text-lg font-medium text-zinc-600 dark:text-zinc-300 mt-2 tracking-tight">
              我一直在努力成为更好的自己 · Java 后端开发工程师
            </p>
          </div>

          {/* 个人陈述 (精炼克制，消灭大段文字堆叠) */}
          <div className="max-w-[68ch] text-[14px] sm:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-2.5">
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

        {/* 2. 专业技能体系 (Bento Grid 矩阵，规整结构化呈现) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              专业技能体系 · Technical Skills
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              5 大核心领域
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {skillDomains.map((domain) => {
              const Icon = domain.icon;
              return (
                <div
                  key={domain.title}
                  className={`group rounded-2xl p-4.5 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 ${
                    domain.colSpan || ""
                  }`}
                >
                  <div className="space-y-3">
                    {/* 卡片头部：图标 + 标题 + 掌握程度 Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                        </span>
                        <h2 className="text-xs sm:text-[13.5px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                          {domain.title}
                        </h2>
                      </div>
                      <span
                        className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border ${domain.badgeColor} shrink-0`}
                      >
                        {domain.level}
                      </span>
                    </div>

                    {/* 技术标签胶囊流 */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {domain.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* 规范细则清单 (项目化 Bullet 点状呈现，规避长文本堆叠) */}
                    <ul className="space-y-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 pt-1">
                      {domain.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${domain.dotColor} mt-1.5 shrink-0 opacity-70`} />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. 精选项目展示 (仅在数据库有真实精选项目时展示) */}
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

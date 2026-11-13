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
  Terminal,
} from "lucide-react";
import { GithubIcon } from "./icons";
import { BaoCoreLogo } from "./BaoCoreLogo";
import { AUTHOR_EMAIL, GITHUB_URL } from "@/lib/siteConfig";

interface HeroProps {
  onOpenResume: () => void;
  benchmarkSlug?: string;
}

export function Hero({
  onOpenResume,
  benchmarkSlug = "java-21-virtual-threads-benchmark-pitfalls",
}: HeroProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [stageTab, setStageTab] = useState<"benchmark" | "code">("benchmark");

  const handleCopyEmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(AUTHOR_EMAIL);
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Stage */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-7">
          <div>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  肉包
                </h1>
                <p className="text-sm sm:text-base font-medium text-zinc-500 dark:text-zinc-400 mt-1.5">
                  全栈软件工程师 · 专注于高性能后端架构与现代 Web 开发
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-2.5">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    中国 · 杭州
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">/</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    开放后端架构与全栈工程交流
                  </span>
                </div>
              </div>
            </div>

            <div className="max-w-[60ch] text-sm sm:text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-3.5 mb-7">
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
                技术上追求清晰的模块边界、短事务设计与单机极致吞吐，避免无意义的过度设计。这里记录我正在维护的开源项目、性能压测心得与长期的技术笔记。
              </p>
            </div>

            {/* Clean Minimal Action Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={onOpenResume}
                className="tactile-btn min-h-[40px] px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 inline-flex items-center gap-2 text-xs font-medium cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>查看与下载简历 (PDF)</span>
              </button>

              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="tactile-btn min-h-[40px] px-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </a>

              <a
                href={`mailto:${AUTHOR_EMAIL}`}
                onClick={handleCopyEmail}
                title={`点击复制邮箱 ${AUTHOR_EMAIL}`}
                className="tactile-btn min-h-[40px] px-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
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

              <a
                href="#blog"
                className="tactile-btn min-h-[40px] px-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
              >
                <span>技术笔记</span>
                <ArrowDownRight className="w-3.5 h-3.5 text-zinc-400" />
              </a>
            </div>
          </div>

          {/* 3-Pillar Engineered Capabilities Strip (No Boxed Cramping) */}
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

        {/* Right Stage: Sleek Flagship Benchmark Console */}
        <div className="lg:col-span-5">
          <div className="clean-card rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/90 dark:border-zinc-700/60 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden p-1">
                  <BaoCoreLogo className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Roubao Gateway
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    2C4G 实测基线 · Java 21 + Netty
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Key Metrics Row - Unified Divider Strip (No chunky gray boxes) */}
            <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800/80 py-1">
              <div className="pr-2">
                <div className="text-[11px] text-zinc-400 font-mono">单机吞吐</div>
                <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 tabular-nums tracking-tight">
                  38K
                </div>
                <div className="text-[10px] font-mono text-zinc-400">req/sec</div>
              </div>
              <div className="px-2.5">
                <div className="text-[11px] text-zinc-400 font-mono">P99 延迟</div>
                <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 tabular-nums tracking-tight">
                  4.2ms
                </div>
                <div className="text-[10px] font-mono text-zinc-400">全链路透传</div>
              </div>
              <div className="pl-2.5">
                <div className="text-[11px] text-zinc-400 font-mono">并发错误</div>
                <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums tracking-tight">
                  0.0%
                </div>
                <div className="text-[10px] font-mono text-zinc-400">5000 VU k6</div>
              </div>
            </div>

            {/* Switchable Benchmark / Code Console */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  实测数据切片
                </span>
                <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50">
                  <button
                    onClick={() => setStageTab("benchmark")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      stageTab === "benchmark"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    压测对比
                  </button>
                  <button
                    onClick={() => setStageTab("code")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      stageTab === "code"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    锁隔离代码
                  </button>
                </div>
              </div>

              {stageTab === "benchmark" ? (
                <div className="p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3 text-xs tabular-nums">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 text-xs">
                        Java 21 虚拟线程 (2000 并发)
                      </span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        18,950 QPS
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full w-[92%] rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                        传统线程池 max=200 (2000 并发)
                      </span>
                      <span className="font-mono text-zinc-500 dark:text-zinc-400">
                        3,910 QPS
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full w-[21%] rounded-full bg-zinc-400 dark:bg-zinc-600" />
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed pt-0.5">
                    模拟 50ms 网络 I/O 阻塞：内存由 1.8 GB 降至 1.1 GB，连接池维持 15~20 即可跑满网卡。
                  </p>
                </div>
              ) : (
                <pre className="p-3.5 rounded-xl bg-zinc-900 dark:bg-black border border-zinc-800 text-zinc-200 text-[11px] font-mono leading-relaxed overflow-x-auto">
                  <code>{`private final ReentrantLock lock = new ReentrantLock();

public String fetchConfigFixed() {
  lock.lock();
  try {
    return restTemplate.getForObject(url, String.class);
  } finally {
    lock.unlock();
  }
}`}</code>
                </pre>
              )}
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href={`/blog/${benchmarkSlug}`}
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <span>阅读《Java 21 虚拟线程压测与踩坑记录》</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
              <a
                href="#projects"
                className="text-xs font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                全部项目 ↓
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { ArrowUpRight, Cpu, Database, Layers } from "lucide-react";
import { GithubIcon } from "./icons";
import { Project } from "@/types";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [featuredProject, ...secondaryProjects] = projects;
  const hasDynamicProjects = projects.length > 0;

  return (
    <section
      id="projects"
      className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 border-t border-zinc-200/80 dark:border-zinc-800/80"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-8">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-1">
            Featured Engineering Work
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            代表开源项目展厅
          </h2>
          <p className="text-xs sm:text-[14px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            围绕单机极致吞吐内核、轻量化全链路追踪与现代 Web 触感体验的工程实践
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasDynamicProjects ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums shrink-0">
                {projects.length} 项开源实践在线
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 text-xs font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              在研工坊 · 筹备发布中
            </span>
          )}
        </div>
      </div>

      {/* 动态项目列表 VS 在研工坊蓝图 (No Giant Dead Empty Box) */}
      {hasDynamicProjects ? (
        <div className="card-focus-group space-y-4">
          {/* 1. 精选项目卡片 */}
          {featuredProject && (
            <article className="group-card apple-card rounded-[24px] p-6 sm:p-8 select-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 font-medium">
                        <Cpu className="w-3 h-3" />
                        {featuredProject.techTags?.[0] || "开源项目"}
                      </span>
                      {featuredProject.metricsSummary && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {featuredProject.metricsSummary}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {featuredProject.name}
                    </h3>
                    <p className="text-xs sm:text-[13px] font-medium text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                      {featuredProject.tagline}
                    </p>
                  </div>

                  <p className="text-xs sm:text-[13.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-[62ch]">
                    {featuredProject.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuredProject.techTags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {featuredProject.repoUrl && (
                    <div className="pt-2">
                      <a
                        href={featuredProject.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tactile-btn min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <GithubIcon className="w-4 h-4" />
                        <span>查看源码仓库</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    </div>
                  )}
                </div>

                {featuredProject.architectureHighlights && featuredProject.architectureHighlights.length > 0 && (
                  <div className="lg:col-span-5 p-5 rounded-[18px] border border-black/[0.04] dark:border-white/[0.06] bg-[#767680]/8 dark:bg-[#767680]/15 space-y-3.5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                      架构亮点
                    </div>
                    <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                      {featuredProject.architectureHighlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-1.5 shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          )}

          {/* 次级项目网格 */}
          {secondaryProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondaryProjects.map((project) => (
                <article
                  key={project.id}
                  className="group-card apple-card rounded-[22px] p-6 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all select-none"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {project.metrics && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50 mb-1">
                            {project.metrics}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                          {project.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                          {project.tagline}
                        </p>
                      </div>
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    {project.techTags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 在研工坊蓝图看板 (Engineering Lab & Architecture Blueprint) */
        <div className="space-y-4">
          {/* 主看板: 实践方向 1 (网关内核) */}
          <div className="apple-card rounded-[26px] p-6 sm:p-8 space-y-5 select-none relative overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/40">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      高性能 API 网关内核实践
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
                      IN THE LAB
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                    Java 21 Virtual Threads · Netty 4.1 · Redis 7 Lua 限流
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>代码规范梳理与基准压测中</span>
              </div>
            </div>

            <p className="text-xs sm:text-[14px] text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
              针对传统响应式 WebFlux 调试成本高、排障堆栈割裂的问题，探索使用 Java 21 虚拟线程调度替代复杂异步回调。重点攻关 synchronized 导致底层 Carrier Thread 被死锁占满（Pinning）的锁隔离方案与纳秒级 Redis + Lua 原子限流。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 space-y-1">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">技术亮点 01</div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">ReentrantLock 锁隔离</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">保障虚拟线程在 I/O 期间无缝卸载</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 space-y-1">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">技术亮点 02</div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Redis 7 Lua 原子限流</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">单机无缝支持滑动窗口与令牌桶策略</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 space-y-1">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">技术亮点 03</div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">全链路 TraceId 透传</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">兼容 W3C Trace Context 与 OTel 规范</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {["Java 21", "Spring Boot 3", "Netty", "Redis 7", "Virtual Threads", "k6 Benchmark"].map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* 次级看板: 实践方向 2 (存储追踪) & 实践方向 3 (微交互组件库) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 2. 存储与链路追踪 */}
            <div className="apple-card rounded-[22px] p-6 space-y-4 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-800/40">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      轻量化分布式全链路追踪看板
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      ClickHouse 列式压缩 · 低成本存储
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
                  预研中
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                针对中小团队与个人架构，相比 ElasticSearch 方案降低约 70% 内存驻留与磁盘开销。利用 ClickHouse 高速列式压缩与 ZSTD，实现纳秒级日志检索与轻量可视化拓扑。
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                {["ClickHouse", "列式压缩", "OpenTelemetry", "Vector"].map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. 触感 UI 组件库 */}
            <div className="apple-card rounded-[22px] p-6 space-y-4 border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      Tactile UI (温润物理微交互组件库)
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      Apple HIG 空间规范 · 超椭圆连续曲率
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                  体验调优
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                提炼自 Apple HIG 与 Linear 设计规范，严格遵循 44pt 触控预算、天顶 1px 晶莹高光与无布局抖动性能调校。打包体积仅 12 KB，带来真实硬件级的物理微按压触感。
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                {["React 19", "Tailwind v4", "连续超椭圆", "Spring Physics"].map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

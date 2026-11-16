"use client";

import React, { useState } from "react";
import { ArrowUpRight, Cpu, Database, Sparkles, Activity, Layers, Check } from "lucide-react";
import { GithubIcon } from "./icons";
import { Project } from "@/types";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [featuredProject, ...secondaryProjects] = projects;
  const [tactileClicks, setTactileClicks] = useState(0);
  const [tactileActive, setTactileActive] = useState(false);

  const handleTactileClick = () => {
    setTactileClicks((prev) => prev + 1);
    setTactileActive(true);
    setTimeout(() => setTactileActive(false), 200);
  };

  return (
    <section
      id="projects"
      className="py-14 sm:py-18 max-w-6xl mx-auto px-4 sm:px-6 border-t border-zinc-200/80 dark:border-zinc-800/80"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-1">
            Featured Engineering Work
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            代表开源项目展厅
          </h2>
          <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
            围绕单机极致吞吐、轻量化分布式追踪与前端触感组件库的开源实践
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-zinc-400 font-mono tabular-nums shrink-0">
            {projects.length} 项开源实践在线
          </span>
        </div>
      </div>

      {/* Brittany Chiang / One Page Love Focus-Dimming Bento Grid */}
      <div className="card-focus-group space-y-4">
        {/* 1. Featured Bento Hero Card: Roubao Gateway */}
        {featuredProject && (
          <article className="group-card apple-card bento-card p-6 sm:p-8 group select-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left Info Column */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 font-medium">
                      <Cpu className="w-3 h-3" />
                      API Gateway
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      38K QPS / P99 4.2ms
                    </span>
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
                  {featuredProject.techTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
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
              </div>

              {/* Right Telemetry Column (Linear Bento Style) */}
              <div className="lg:col-span-5 p-5 rounded-[18px] border border-black/[0.04] dark:border-white/[0.06] bg-[#767680]/8 dark:bg-[#767680]/15 space-y-3.5">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    架构亮点与实测基准
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">2C4G 压测</span>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {featuredProject.architectureHighlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-1.5 shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.05] space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    <span>单机吞吐表现</span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-medium">18,950 QPS (虚拟线程)</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* 2 & 3. Secondary Bento Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secondaryProjects.map((project) => {
            const isTactile = project.id === "tactile-ui";
            const isTrace = project.id === "cloud-trace";

            return (
              <article
                key={project.id}
                className="group-card apple-card bento-card p-6 sm:p-7 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all select-none"
              >
                <div className="space-y-3.5">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
                          {isTrace && <Database className="w-3 h-3 text-purple-500" />}
                          {isTactile && <Layers className="w-3 h-3 text-amber-500" />}
                          {project.metrics}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
                        className="tactile-btn min-h-[44px] min-w-[44px] -mr-2 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="源码仓库"
                        aria-label={`${project.name} GitHub 源码仓库`}
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {project.description}
                  </p>

                  {/* 特色交互插槽: Tactile UI 真实按压测试微交互 */}
                  {isTactile && (
                    <div className="p-3.5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          触觉反馈在线试玩
                        </span>
                        <span>按压次数: {tactileClicks}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleTactileClick}
                        className={`w-full min-h-[44px] rounded-xl font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 ${
                          tactileActive
                            ? "scale-[0.96] bg-blue-600 text-white shadow-inner"
                            : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs"
                        }`}
                      >
                        <span className="font-semibold">轻触测试物理弹簧阻尼反馈</span>
                        {tactileActive && <Check className="w-3.5 h-3.5 text-white animate-bounce" />}
                      </button>
                    </div>
                  )}

                  {/* 特色插槽: CloudTrace 存储降低对比度 */}
                  {isTrace && (
                    <div className="p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2 text-xs">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        <span>ClickHouse vs ElasticSearch 内存</span>
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">-70% 开销</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                          <span className="w-14">ES 内存</span>
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                            <div className="h-full w-full bg-zinc-400 dark:bg-zinc-600" />
                          </div>
                          <span>4.2 GB</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                          <span className="w-14">CK 内存</span>
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                            <div className="h-full w-[30%] bg-purple-500" />
                          </div>
                          <span className="text-purple-600 dark:text-purple-400 font-medium">1.2 GB</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <ul className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                    {project.architectureHighlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.5 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  {project.techTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-[11px] font-mono rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

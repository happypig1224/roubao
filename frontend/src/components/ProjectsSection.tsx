"use client";

import React from "react";
import { ArrowUpRight, Cpu } from "lucide-react";
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
      className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 border-t border-zinc-200/80 dark:border-zinc-800/80"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-1">
            Featured Engineering Work
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            代表开源项目展厅
          </h2>
          <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            围绕单机极致吞吐、轻量化分布式追踪与现代 Web 交互的工程实践
          </p>
        </div>

        {hasDynamicProjects && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums shrink-0">
              {projects.length} 项开源实践在线
            </span>
          </div>
        )}
      </div>

      {/* 真实项目列表 VS 干净纯粹的空状态 (绝无任何虚构项目数据) */}
      {hasDynamicProjects ? (
        <div className="card-focus-group space-y-4">
          {featuredProject && (
            <article className="group-card apple-card rounded-[22px] p-6 sm:p-7 select-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">
                    <Cpu className="w-3 h-3" />
                    {featuredProject.techTags?.[0] || "开源项目"}
                  </span>
                  {featuredProject.metricsSummary && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {featuredProject.metricsSummary}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  {featuredProject.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  {featuredProject.tagline}
                </p>
                <p className="text-xs sm:text-[13.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {featuredProject.description}
                </p>

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
            </article>
          )}

          {secondaryProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondaryProjects.map((project) => (
                <article
                  key={project.id}
                  className="group-card apple-card rounded-[20px] p-5 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all select-none"
                >
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                      {project.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      {project.tagline}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 纯粹极简的空状态：不渲染任何虚构卡片与伪造蓝图 */
        <div className="py-12 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-xs sm:text-[13px] text-zinc-400 dark:text-zinc-500 font-mono">
            暂无已公开发布的开源项目
          </p>
        </div>
      )}
    </section>
  );
}

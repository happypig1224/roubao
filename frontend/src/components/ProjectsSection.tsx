"use client";

import React from "react";
import { ArrowUpRight, Cpu, Activity } from "lucide-react";
import { GithubIcon } from "./icons";
import { Project } from "@/types";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [featuredProject, ...secondaryProjects] = projects;

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

      {/* Empty State vs Dynamic Project Grid */}
      {projects.length === 0 ? (
        <div className="apple-card rounded-[22px] py-16 px-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#767680]/10 dark:bg-[#767680]/20 flex items-center justify-center text-[#8e8e93]">
            <Cpu className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <div className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
              暂无开源项目展示
            </div>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
              可在后台管理控制台录入新项目并勾选精选推荐
            </p>
          </div>
        </div>
      ) : (
        <div className="card-focus-group space-y-4">
          {/* 1. Featured Bento Hero Card */}
          {featuredProject && (
            <article className="group-card apple-card bento-card p-6 sm:p-8 group select-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {/* Left Info Column */}
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
                  )}
                </div>

                {/* Right Highlights Column */}
                {featuredProject.architectureHighlights && featuredProject.architectureHighlights.length > 0 && (
                  <div className="lg:col-span-5 p-5 rounded-[18px] border border-black/[0.04] dark:border-white/[0.06] bg-[#767680]/8 dark:bg-[#767680]/15 space-y-3.5">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        架构亮点
                      </span>
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

          {/* 2 & 3. Secondary Bento Grid Cards */}
          {secondaryProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondaryProjects.map((project) => (
                <article
                  key={project.id}
                  className="group-card apple-card bento-card p-6 sm:p-7 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all select-none"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {project.metrics && (
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
                              {project.metrics}
                            </span>
                          </div>
                        )}
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

                    {project.architectureHighlights && project.architectureHighlights.length > 0 && (
                      <ul className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                        {project.architectureHighlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.5 shrink-0" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    {project.techTags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 text-[11px] font-mono rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
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
      )}
    </section>
  );
}

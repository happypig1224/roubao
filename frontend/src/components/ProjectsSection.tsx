"use client";

import React from "react";
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
      className="py-12 max-w-6xl mx-auto px-4 sm:px-6 border-t border-zinc-200 dark:border-zinc-800"
    >
      {/* Header */}
      <div className="flex items-baseline justify-between gap-4 mb-8">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            代表项目
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            围绕单机极致吞吐、轻量化可观测与前端工程组件的开源实践
          </p>
        </div>
        <span className="text-xs text-zinc-400 font-mono tabular-nums shrink-0">
          {projects.length} 项开源实践
        </span>
      </div>

      {/* Projects Bento */}
      <div className="space-y-4">
        {featuredProject && (
          <article className="clean-card rounded-2xl p-6 sm:p-7 group shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left Column: Core Identity & Narrative */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {featuredProject.name}
                    </h3>
                    {featuredProject.metrics && (
                      <span className="text-[11px] font-mono tabular-nums px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-medium">
                        {featuredProject.metrics}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono">
                    {featuredProject.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-[62ch]">
                  {featuredProject.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {featuredProject.techTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-[11px] font-mono rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2">
                  <a
                    href={featuredProject.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tactile-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-medium transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>查看源码仓库</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Sleek Integrated Highlights (No chunky grey inner box) */}
              <div className="lg:col-span-5 p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
                  核心技术实现 / Highlights
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {featuredProject.architectureHighlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.5 shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secondaryProjects.map((project) => (
            <article
              key={project.id}
              className="clean-card rounded-2xl p-5 sm:p-6 group flex flex-col justify-between shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      {project.metrics && (
                        <span className="text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                          {project.metrics}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                      {project.tagline}
                    </p>
                  </div>

                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tactile-btn p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="源码仓库"
                      aria-label={`${project.name} GitHub 源码仓库`}
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {project.description}
                </p>

                <ul className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {project.architectureHighlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.5 shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                {project.techTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ListTree, PanelLeftClose, Search, X } from "lucide-react";
import { TocHeading } from "@/lib/markdown";

interface ArticleTocProps {
  headings: TocHeading[];
  activeId: string;
  onSelectHeading: (id: string) => void;
  onToggleCollapse: () => void;
}

export function ArticleToc({
  headings,
  activeId,
  onSelectHeading,
  onToggleCollapse,
}: ArticleTocProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHeadings = useMemo(() => {
    if (!searchQuery.trim()) return headings;
    const q = searchQuery.toLowerCase().trim();
    return headings.filter((h) => h.text.toLowerCase().includes(q));
  }, [headings, searchQuery]);

  return (
    <aside
      aria-label="文章目录管理"
      className="apple-card rounded-[22px] p-4 flex flex-col h-full max-h-[calc(100vh-6.5rem)] w-72 xl:w-80 backdrop-blur-[20px] saturate-[185%] select-none"
    >
      {/* 顶部: 返回文章列表导航 (常驻大纲顶部，从 0 滚动位置即锚定，彻底杜绝向下滚动时的布局位移与元素剥离) */}
      <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
        <Link
          href="/#blog"
          className="tactile-btn -mx-1 px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
          <span>返回文章列表</span>
        </Link>
      </div>

      {/* 目录标题行与仿飞书大纲收起按钮 */}
      <div className="flex items-center justify-between pt-2.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <ListTree className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            目录
          </h2>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
            {headings.length}
          </span>
        </div>

        {/* 仿飞书大纲收起按钮 (44pt 触控热区) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="收起目录"
          className="relative group tactile-btn hit-budget-44 -mr-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ios-pressable"
        >
          <PanelLeftClose className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 text-[11px] font-medium bg-zinc-900/95 text-zinc-100 dark:bg-zinc-100/95 dark:text-zinc-900 px-2 py-0.5 rounded-md shadow-md">
            收起目录
          </div>
        </button>
      </div>

      {/* 快速小节过滤搜索框 */}
      {headings.length > 8 && (
        <div className="relative my-2.5 shrink-0">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索目录..."
            className="w-full pl-8 pr-8 py-1 text-xs rounded-lg bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="清空小节搜索"
              className="absolute right-0 top-1/2 -translate-y-1/2 hit-budget-44 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer ios-pressable"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                <X className="w-2 h-2" />
              </span>
            </button>
          )}
        </div>
      )}

      {/* 仿飞书目录层级列表 */}
      <nav className="flex-1 overflow-y-auto pr-1 mt-1 space-y-0.5 no-scrollbar scroll-smooth">
        {filteredHeadings.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 font-mono">
            未找到匹配小节
          </div>
        ) : (
          filteredHeadings.map((item) => {
            const isActive = activeId === item.id;

            // 恒定字重配置，彻底杜绝激活状态导致文字加粗、发生折行引起目录垂直跳跃
            let indentClass = "pl-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200";
            if (item.level === 2) {
              indentClass = "pl-4 text-xs font-medium text-zinc-700 dark:text-zinc-300";
            } else if (item.level === 3) {
              indentClass = "pl-7 text-[11.5px] font-normal text-zinc-600 dark:text-zinc-400";
            } else if (item.level >= 4) {
              indentClass = "pl-9 text-[11px] font-normal text-zinc-500 dark:text-zinc-500";
            }

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectHeading(item.id);
                }}
                className={`group relative block py-1.5 pr-2.5 rounded-lg transition-colors text-left leading-snug cursor-pointer ${indentClass} ${
                  isActive
                    ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:bg-blue-600 dark:before:bg-blue-400 before:rounded-full shadow-2xs"
                    : "hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50"
                }`}
              >
                <span className="line-clamp-2">{item.text}</span>
              </a>
            );
          })
        )}
      </nav>
    </aside>
  );
}

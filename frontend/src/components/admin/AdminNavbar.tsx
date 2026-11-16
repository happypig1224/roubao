"use client";

import React from "react";
import { LayoutDashboard, FileText, FolderTree, Boxes, ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { BaoCoreLogo } from "@/components/BaoCoreLogo";

export type AdminTab = "dashboard" | "articles" | "categories" | "projects";

interface AdminNavbarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}

/**
 * 后台管理控制台顶部导航栏
 *
 * @author roubao
 * @since 2026-11-16
 */
export function AdminNavbar({ activeTab, onTabChange, onLogout }: AdminNavbarProps) {
  const tabs = [
    { key: "dashboard" as AdminTab, label: "仪表大盘", icon: LayoutDashboard },
    { key: "articles" as AdminTab, label: "文章管理", icon: FileText },
    { key: "categories" as AdminTab, label: "分类体系", icon: FolderTree },
    { key: "projects" as AdminTab, label: "开源展厅", icon: Boxes },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#121214]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <BaoCoreLogo className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                Roubao
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                ADMIN
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-[11px] text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>已鉴权</span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="新标签页打开前台门户主页"
          >
            <span>门户主页</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </a>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            title="退出管理员身份并清除凭证"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">退出</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-200 dark:border-zinc-800 px-2 py-1.5 bg-zinc-50/50 dark:bg-zinc-900/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

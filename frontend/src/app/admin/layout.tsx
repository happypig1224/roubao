import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "后台管理控制台 - 肉包 (Roubao)",
  description: "肉包独立个人博客与开源展厅内容管理系统",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * 后台管理独立布局结构 (隔离前台导航与浮窗，保障用户端绝对纯净)
 *
 * @author roubao
 * @since 2026-11-16
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 flex flex-col antialiased selection:bg-blue-500/20 selection:text-blue-600">
      {children}
    </div>
  );
}

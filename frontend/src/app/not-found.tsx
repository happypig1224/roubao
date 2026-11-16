import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, BookOpen } from "lucide-react";
import { BaoCoreLogo } from "@/components/BaoCoreLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0c0d] flex items-center justify-center px-4 py-16">
      <div className="apple-card rounded-[24px] max-w-md w-full p-8 text-center space-y-6 select-none border border-black/[0.06] dark:border-white/[0.08] shadow-lg">
        {/* Logo 徽标 */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-[#1c1c1e] border border-zinc-200/90 dark:border-zinc-700/60 shadow-xs flex items-center justify-center p-2">
          <BaoCoreLogo className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-[11px] font-mono font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
            404 Not Found
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            页面或文章未找到
          </h1>
          <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            你访问的内容可能已变更别名、被归档或链接有误。请使用下方按钮返回主站。
          </p>
        </div>

        {/* 操作按钮组 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto tactile-btn min-h-[44px] px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 inline-flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ios-pressable"
          >
            <Home className="w-4 h-4" />
            <span>返回主页</span>
          </Link>

          <Link
            href="/#blog"
            className="w-full sm:w-auto tactile-btn min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center justify-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer ios-pressable"
          >
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span>浏览技术文章</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

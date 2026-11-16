"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 客户端异常日志记录
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0c0d] flex items-center justify-center px-4 py-16">
      <div className="apple-card rounded-[24px] max-w-md w-full p-8 text-center space-y-6 select-none border border-black/[0.06] dark:border-white/[0.08] shadow-lg">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-[11px] font-mono font-semibold tracking-wider uppercase text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full">
            Unexpected Error
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            页面渲染发生异常
          </h1>
          <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
            系统遇到了临时故障或网络波动。你可以尝试刷新重试，或直接返回主页。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto tactile-btn min-h-[44px] px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 inline-flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ios-pressable"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重试加载</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto tactile-btn min-h-[44px] px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 inline-flex items-center justify-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer ios-pressable"
          >
            <Home className="w-4 h-4 text-zinc-400" />
            <span>返回主页</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

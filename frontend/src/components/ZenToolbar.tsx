"use client";

import React from "react";
import {
  Maximize2,
  Minimize2,
  Type,
  BookOpen,
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

export type ReaderFontSize = "sm" | "base" | "lg";
export type ReaderFontFamily = "sans" | "serif";
export type ReaderThemeTone = "default" | "paper" | "oled";

interface ZenToolbarProps {
  zenMode: boolean;
  onToggleZenMode: () => void;
  fontSize: ReaderFontSize;
  onChangeFontSize: (size: ReaderFontSize) => void;
  fontFamily: ReaderFontFamily;
  onChangeFontFamily: (family: ReaderFontFamily) => void;
  themeTone: ReaderThemeTone;
  onChangeThemeTone: (tone: ReaderThemeTone) => void;
  readingProgress?: number; // 0 - 100
  estimatedRemainingMinutes?: number;
}

export function ZenToolbar({
  zenMode,
  onToggleZenMode,
  fontSize,
  onChangeFontSize,
  fontFamily,
  onChangeFontFamily,
  themeTone,
  onChangeThemeTone,
  readingProgress = 0,
  estimatedRemainingMinutes,
}: ZenToolbarProps) {
  const handleToggleZen = () => {
    triggerHaptic(zenMode ? "light" : "medium");
    onToggleZenMode();
  };

  const handleNextFontSize = (delta: number) => {
    triggerHaptic("selection");
    const sizes: ReaderFontSize[] = ["sm", "base", "lg"];
    const idx = sizes.indexOf(fontSize);
    const nextIdx = Math.max(0, Math.min(sizes.length - 1, idx + delta));
    onChangeFontSize(sizes[nextIdx]);
  };

  const handleToggleFont = () => {
    triggerHaptic("selection");
    onChangeFontFamily(fontFamily === "sans" ? "serif" : "sans");
  };

  const handleToneSelect = (tone: ReaderThemeTone) => {
    triggerHaptic("selection");
    onChangeThemeTone(tone);
  };

  if (zenMode) {
    return (
      <aside aria-label="禅阅读悬浮控制器" className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {/* 阅读进度微胶囊 */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 dark:bg-zinc-900/90 text-white backdrop-blur-md border border-white/10 shadow-lg text-xs font-mono tabular-nums select-none">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>已读 {Math.round(readingProgress)}%</span>
          {estimatedRemainingMinutes !== undefined && estimatedRemainingMinutes > 0 && (
            <>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300">余 {estimatedRemainingMinutes} 分钟</span>
            </>
          )}
        </div>

        {/* 浮动退出禅模式胶囊 */}
        <button
          type="button"
          onClick={handleToggleZen}
          aria-label="退出禅模式"
          data-reader-control="true"
          className="tactile-depress min-w-[44px] min-h-[44px] px-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-[13px] shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Minimize2 className="w-4 h-4" />
          <span>退出禅模式</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-700/60 text-blue-100">
            ESC
          </kbd>
        </button>
      </aside>
    );
  }

  return (
    <div
      aria-label="阅读偏好排版设置工具栏"
      className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/70 backdrop-blur-md shadow-2xs"
    >
      {/* 禅模式触发按钮 */}
      <button
        type="button"
        onClick={handleToggleZen}
        aria-label="开启禅模式"
        data-reader-control="true"
        title="开启禅模式 (快捷键: Z)"
        className="tactile-depress hit-budget-44 px-3 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
      >
        <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline">禅模式</span>
      </button>

      <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

      {/* 字号微调 (A- / A+) */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => handleNextFontSize(-1)}
          disabled={fontSize === "sm"}
          aria-label="减小正文字号"
          data-reader-control="true"
          className="tactile-depress hit-budget-44 w-9 h-9 rounded-xl hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-600 dark:text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
        >
          A-
        </button>
        <button
          type="button"
          onClick={() => handleNextFontSize(1)}
          disabled={fontSize === "lg"}
          aria-label="增大正文字号"
          data-reader-control="true"
          className="tactile-depress hit-budget-44 w-9 h-9 rounded-xl hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-zinc-600 dark:text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
        >
          A+
        </button>
      </div>

      <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

      {/* 字体家族切换 (Sans / Serif) */}
      <button
        type="button"
        onClick={handleToggleFont}
        aria-label={fontFamily === "sans" ? "切换衬线体" : "切换无衬线体"}
        data-reader-control="true"
        title={fontFamily === "sans" ? "当前: 无衬线体 (点击切至文艺宋体/Serif)" : "当前: 衬线体 (点击切至现代黑体/Sans)"}
        className="tactile-depress hit-budget-44 px-2.5 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
      >
        <Type className="w-3.5 h-3.5 text-zinc-500" />
        <span className={fontFamily === "serif" ? "font-reader-serif font-bold text-amber-700 dark:text-amber-400" : ""}>
          {fontFamily === "sans" ? "黑体" : "宋体"}
        </span>
      </button>

      <div className="w-[1px] h-4 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

      {/* 阅读纸色氛围切换 */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleToneSelect("default")}
          aria-label="默认系统色"
          data-reader-control="true"
          title="系统默认"
          className={`tactile-depress hit-budget-44 w-8 h-8 rounded-full border text-[10px] flex items-center justify-center font-bold cursor-pointer transition-all ${
            themeTone === "default"
              ? "border-blue-500 bg-white dark:bg-zinc-700 text-blue-600 shadow-xs"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          适
        </button>

        <button
          type="button"
          onClick={() => handleToneSelect("paper")}
          aria-label="护眼暖纸色"
          data-reader-control="true"
          title="护眼暖纸模式 (柔和米黄底色)"
          className={`tactile-depress hit-budget-44 w-8 h-8 rounded-full border text-[10px] flex items-center justify-center font-bold cursor-pointer transition-all ${
            themeTone === "paper"
              ? "border-amber-600 bg-[#f6f0df] text-amber-900 shadow-xs"
              : "border-transparent bg-[#f6f0df]/60 text-amber-800/80 hover:bg-[#f6f0df]"
          }`}
        >
          纸
        </button>

        <button
          type="button"
          onClick={() => handleToneSelect("oled")}
          aria-label="纯黑极客色"
          data-reader-control="true"
          title="纯黑 OLED 极客模式"
          className={`tactile-depress hit-budget-44 w-8 h-8 rounded-full border text-[10px] flex items-center justify-center font-bold cursor-pointer transition-all ${
            themeTone === "oled"
              ? "border-zinc-400 bg-black text-white shadow-xs"
              : "border-transparent bg-zinc-900/60 text-zinc-400 hover:bg-black hover:text-white"
          }`}
        >
          墨
        </button>
      </div>
    </div>
  );
}

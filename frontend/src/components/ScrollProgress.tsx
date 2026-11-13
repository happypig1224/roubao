"use client";

import React, { useEffect, useRef } from "react";

export type ScrollProgressTheme = "amber" | "obsidian" | "blue" | "emerald";

/**
 * 滚动进度条色彩预设体系（告别廉价电光刺眼感，融入温润工匠质感）
 * - blue (当前默认): Cupertino 苹果官方标准工程蔚蓝，纯正干练，剔除电光紫幻
 * - amber: 暖金琥珀/焦糖温润渐变，契合“肉包 (Roubao)”手工质感与人文温度
 * - obsidian: Apple & Linear 极简黑曜石墨，纯粹黑白灰高级质感，零视觉噪音
 * - emerald: 翡翠薄荷/生机青竹，呼应 Logo 绿意与状态徽标
 */
const ACTIVE_THEME: ScrollProgressTheme = "blue";

const THEME_CONFIG: Record<
  ScrollProgressTheme,
  { label: string; barClass: string; shadowClass: string }
> = {
  amber: {
    label: "暖金琥珀 (Warm Amber)",
    barClass:
      "bg-gradient-to-b from-amber-500 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-amber-300 dark:to-orange-400",
    shadowClass:
      "shadow-[0_0_6px_rgba(245,158,11,0.25)] dark:shadow-[0_0_8px_rgba(251,191,36,0.3)]",
  },
  obsidian: {
    label: "极简黑曜 (Obsidian Graphite)",
    barClass:
      "bg-gradient-to-b from-zinc-800 via-zinc-950 to-zinc-900 dark:from-zinc-200 dark:via-zinc-100 dark:to-zinc-300",
    shadowClass:
      "shadow-[0_0_4px_rgba(0,0,0,0.12)] dark:shadow-[0_0_6px_rgba(255,255,255,0.2)]",
  },
  blue: {
    label: "苹果蔚蓝 (Cupertino Blue)",
    barClass:
      "bg-gradient-to-b from-blue-600 via-sky-500 to-blue-600 dark:from-blue-400 dark:via-sky-300 dark:to-blue-400",
    shadowClass:
      "shadow-[0_0_6px_rgba(37,99,235,0.2)] dark:shadow-[0_0_8px_rgba(96,165,250,0.25)]",
  },
  emerald: {
    label: "翡翠青竹 (Emerald Jade)",
    barClass:
      "bg-gradient-to-b from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400",
    shadowClass:
      "shadow-[0_0_6px_rgba(16,185,129,0.2)] dark:shadow-[0_0_8px_rgba(52,211,153,0.25)]",
  },
};

export function ScrollProgress({
  theme = ACTIVE_THEME,
}: {
  theme?: ScrollProgressTheme;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEME_CONFIG[theme] ?? THEME_CONFIG.amber;

  useEffect(() => {
    let rafId: number | null = null;

    const update = () => {
      if (!barRef.current) return;

      // 1. 动态获取当前顶部被覆盖的高度（实时测量）
      const coveredFromTop =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        0;

      // 2. 动态获取全文档当前最新高度与视口高度（毫秒级响应）
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const lastPageTop = scrollHeight - window.innerHeight;

      if (lastPageTop <= 0) {
        barRef.current.style.transform = "scaleY(0)";
        return;
      }

      // 3. 连续浮点比率计算
      const ratio = Math.min(1, Math.max(0, coveredFromTop / lastPageTop));
      barRef.current.style.transform = `scaleY(${ratio})`;
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        update();
        rafId = null;
      });
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    // 4. 接入 ResizeObserver，监听页面任意数据变化、异步撑开导致的 DOM 高度变长，自动重算终点
    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });
    resizeObserver.observe(document.documentElement);
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 right-0 w-[3px] h-screen z-50 pointer-events-none"
    >
      {/* 极简微透底轨：柔和淡灰/暗调微透，不突兀、不割裂页面 */}
      <div className="absolute inset-0 bg-zinc-200/50 dark:bg-zinc-800/50" />

      {/* 工匠级注水流动色条：消灭电光刺眼感，细腻温润 */}
      <div
        ref={barRef}
        style={{
          transform: "scaleY(0)",
          transformOrigin: "top",
        }}
        className={`w-full h-full ${currentTheme.barClass} ${currentTheme.shadowClass} will-change-transform`}
      />
    </div>
  );
}

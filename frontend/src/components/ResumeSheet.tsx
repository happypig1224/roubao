"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, Mail, MapPin, X, Check, Copy } from "lucide-react";
import { useSpringSheet } from "@/lib/useSpringSheet";
import { AUTHOR_EMAIL, SITE_HOST } from "@/lib/siteConfig";

interface ResumeSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeSheet({ isOpen, onClose }: ResumeSheetProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const touchStartYRef = useRef<number | null>(null);

  const handleExited = useCallback(() => {
    setDragOffset(0);
  }, []);

  const { isMounted, isVisible } = useSpringSheet({
    isOpen,
    durationMs: 460,
    onExited: handleExited,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const delta = e.touches[0].clientY - touchStartYRef.current;
    if (delta > 0) setDragOffset(delta * 0.85);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartYRef.current = null;
    if (dragOffset > 70) {
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  const handleDownloadMarkdown = () => {
    const resumeText = `# 肉包 (Roubao) — 全栈软件工程师
位置: 中国 · 杭州 | Email: ${AUTHOR_EMAIL} | 站点: ${SITE_HOST}

## 核心技术方向
- 后端架构: Java 21 (Virtual Threads), Spring Boot 3, Netty, Redis 7 + Lua, MySQL 8.0
- 前端工程: Next.js App Router, React 19, TypeScript, Tailwind CSS, Web Animations

## 代表开源项目
1. Roubao Gateway (轻量级高吞吐 API 网关)
   - 基于 Java 21 虚拟线程与 Netty 开发，单机 2C4G 实测支撑 38K QPS，P99 延迟 4.2ms
   - Redis 7 + Lua 原子限流与 OpenTelemetry 全链路 TraceId 透传
2. CloudTrace Hub (分布式全链路追踪看板)
   - ClickHouse 列式压缩存储，相比 ElasticSearch 节省 70% 内存
3. Tactile UI (轻量物理动效与微交互组件库)
   - 同心圆角补偿与原生 Web Animations 弹簧阻尼，打包体积 12 KB

## 工程原则
- 清晰的模块边界、短事务设计、单机极致吞吐，避免无意义过度设计。
`;
    const blob = new Blob([resumeText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Roubao-Resume-2026.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(AUTHOR_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-sheet-title"
    >
      <div
        onClick={onClose}
        style={{ transition: "opacity 420ms ease-out" }}
        className={`fixed inset-0 bg-black/45 backdrop-blur-xs ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        style={{
          transform: isVisible
            ? `translate3d(0, ${dragOffset}px, 0)`
            : "translate3d(0, 100%, 0)",
          transition: isDragging
            ? "none"
            : "transform 460ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease-out",
        }}
        className={`relative z-10 w-full sm:max-w-xl max-h-[88dvh] bg-white dark:bg-[#121214] rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col overflow-hidden ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="pt-3 pb-1 flex justify-center sm:hidden cursor-grab active:cursor-grabbing"
        >
          <span className="w-9 h-[5px] rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div>
            <h2
              id="resume-sheet-title"
              className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              肉包 · 工程履历摘要
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
              <span>全栈软件工程师</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                中国 · 杭州
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="关闭履历预览"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs sm:text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">单机网关吞吐</div>
              <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 tabular-nums">
                38K QPS
              </div>
            </div>
            <div className="rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">网关 P99 延迟</div>
              <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 tabular-nums">
                4.2 ms
              </div>
            </div>
            <div className="rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">可观测内存降幅</div>
              <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 tabular-nums">
                -70%
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
              核心技术栈与工程理念
            </h3>
            <p>
              主攻{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                Java 21 虚拟线程 / Spring Boot 3 / Netty
              </strong>{" "}
              高并发服务架构与{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                Next.js / React 19
              </strong>{" "}
              现代前端工程。坚持清晰模块边界、短事务设计与单机极致性能。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              代表工程实践
            </h3>
            <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                <strong className="text-zinc-900 dark:text-zinc-100">Roubao Gateway：</strong>
                2C4G 单机支撑 3.8 万 QPS，Redis 7 + Lua 毫秒级原子限流与 OpenTelemetry 全链路透传。
              </li>
              <li>
                <strong className="text-zinc-900 dark:text-zinc-100">CloudTrace Hub：</strong>
                基于 ClickHouse 列式压缩替代 ES，降低 70% 内存占用并实现流式拓扑瀑布流。
              </li>
              <li>
                <strong className="text-zinc-900 dark:text-zinc-100">Tactile UI：</strong>
                12 KB 零重型依赖组件库，落地面向 React 19 的同心圆角补偿与物理弹簧阻尼。
              </li>
            </ul>
          </div>
        </div>

        <div className="px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+14px)] border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={handleCopyEmail}
            className="tactile-btn px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copiedEmail ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>已复制邮箱</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>{AUTHOR_EMAIL}</span>
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${AUTHOR_EMAIL}`}
              className="tactile-btn px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>发送邮件</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="tactile-btn px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>.md</span>
            </button>

            <a
              href="/Roubao-Resume-2026.pdf"
              download="Roubao-Resume-2026.pdf"
              className="tactile-btn px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载简历 (PDF)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

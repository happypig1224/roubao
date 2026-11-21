"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { copyTextToClipboard } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";

interface MarkdownRendererProps {
  markdown?: string;
  content?: string;
  fontSize?: "sm" | "base" | "lg";
  fontFamily?: "sans" | "serif";
}

export function MarkdownRenderer({
  markdown,
  content,
  fontSize = "sm",
  fontFamily = "sans",
}: MarkdownRendererProps) {
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  const rawText = markdown ?? content ?? "";
  const sanitizedMarkdown = useMemo(() => {
    if (!rawText) return "";
    return rawText.replace(/^#\s+[^\n]+(?:\r?\n)+/, "");
  }, [rawText]);

  const html = useMemo(() => {
    return renderMarkdownToHtml(sanitizedMarkdown);
  }, [sanitizedMarkdown]);

  // ESC 键关闭图片画廊灯箱
  useEffect(() => {
    if (!lightboxImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  const handleContainerClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 1. 代码块复制逻辑
    const btn = target.closest(".code-copy-btn") as HTMLButtonElement | null;
    if (btn) {
      e.preventDefault();
      const rawCode = btn.getAttribute("data-code");
      if (rawCode) {
        const text = decodeURIComponent(rawCode);
        const copied = await copyTextToClipboard(text);
        if (!copied) return;

        triggerHaptic("success");
        const label = btn.querySelector(".copy-label");
        if (label) {
          label.textContent = "已复制";
        }
        btn.classList.add("text-emerald-400", "border-emerald-500/50");

        setTimeout(() => {
          if (label) {
            label.textContent = "复制";
          }
          btn.classList.remove("text-emerald-400", "border-emerald-500/50");
        }, 1800);
      }
      return;
    }

    // 2. 正文图片点击全屏画廊灯箱 (Image Lightbox)
    const img = target.closest("img") as HTMLImageElement | null;
    if (img && img.src) {
      e.preventDefault();
      triggerHaptic("selection");
      setLightboxImage({
        src: img.src,
        alt: img.alt || "技术配图放大预览",
      });
    }
  };

  const fontSizeClass =
    fontSize === "lg"
      ? "text-base sm:text-[19px] leading-[1.85]"
      : fontSize === "base"
      ? "text-base sm:text-[17px] leading-[1.75]"
      : "text-sm sm:text-[15px] leading-relaxed";

  const fontClass =
    fontFamily === "serif" ? "font-reader-serif" : "font-reader-sans";

  return (
    <>
      <div
        onClick={handleContainerClick}
        className={`prose prose-zinc dark:prose-invert max-w-none ${fontSizeClass} ${fontClass} text-zinc-700 dark:text-zinc-300 transition-all duration-200`}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* 极简画廊灯箱模态层 (Apple-style Lightbox) */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="图片大图画廊预览"
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md transition-opacity duration-200 animate-in fade-in cursor-zoom-out"
        >
          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
            aria-label="关闭大图预览"
            className="tactile-depress absolute top-5 right-5 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 居中大图 */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl max-h-[85vh] flex flex-col items-center cursor-default"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            {lightboxImage.alt && (
              <p className="mt-3 text-xs sm:text-sm text-zinc-300 font-mono text-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md">
                {lightboxImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

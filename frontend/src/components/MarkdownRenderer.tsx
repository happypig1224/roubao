"use client";

import React, { useMemo } from "react";
import { renderMarkdownToHtml } from "@/lib/markdown";

interface MarkdownRendererProps {
  markdown: string;
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const html = useMemo(() => {
    return renderMarkdownToHtml(markdown || "");
  }, [markdown]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const btn = target.closest(".code-copy-btn") as HTMLButtonElement | null;
    if (btn) {
      e.preventDefault();
      const rawCode = btn.getAttribute("data-code");
      if (rawCode) {
        const text = decodeURIComponent(rawCode);
        navigator.clipboard.writeText(text);

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
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

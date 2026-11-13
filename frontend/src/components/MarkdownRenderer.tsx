"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { createHeadingSlugger } from "@/lib/markdown";

interface MarkdownRendererProps {
  markdown: string;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  // 正则按超链接、行内代码、粗体、斜体切分
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // 超链接解析: [文本](https://...)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, rawHref] = linkMatch;
      const href = rawHref.trim();
      const isExternal =
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//");

      return (
        <a
          key={i}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-3 font-medium transition-colors"
        >
          <span>{label}</span>
          {isExternal && <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-70" />}
        </a>
      );
    }

    // 行内代码: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded text-[12px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // 粗体: **bold**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // 斜体: *italic*
    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      part.length >= 2 &&
      !part.startsWith("**")
    ) {
      return (
        <em key={i} className="italic text-zinc-800 dark:text-zinc-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function formatFormulaText(raw: string): string {
  return raw
    .slice(2, -2)
    .trim()
    .replace(/\\text\{([^}]+)\}/g, "$1");
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const slugifyHeading = createHeadingSlugger();

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const blocks = markdown.split("\n\n");

  return (
    <div className="text-sm sm:text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 space-y-5">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed || trimmed.startsWith("# ")) return null;

        // 分割线
        if (trimmed === "---") {
          return (
            <hr key={idx} className="border-zinc-200/80 dark:border-zinc-800 my-6" />
          );
        }

        // 引用块: > quote
        if (trimmed.startsWith(">")) {
          const quoteText = trimmed
            .split("\n")
            .map((line) => line.replace(/^>\s?/, ""))
            .join("\n");

          return (
            <blockquote
              key={idx}
              className="my-4 pl-4 py-2 border-l-2 border-blue-500/80 dark:border-blue-400/80 bg-zinc-50/70 dark:bg-zinc-900/40 rounded-r-xl text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed"
            >
              {renderInlineMarkdown(quoteText)}
            </blockquote>
          );
        }

        // 行内图片: ![alt](src)
        const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          const [, alt, src] = imgMatch;
          return (
            <figure key={idx} className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="w-full max-h-[500px] object-contain rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
              />
              {alt && (
                <figcaption className="text-center text-xs text-zinc-400 mt-2 font-mono">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // 二级标题: ## Heading
        if (trimmed.startsWith("## ")) {
          const text = trimmed.slice(3).trim();
          return (
            <h2
              key={idx}
              id={slugifyHeading(text)}
              className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-4 pb-1.5 border-b border-zinc-100 dark:border-zinc-800 scroll-mt-24"
            >
              {text}
            </h2>
          );
        }

        // 三级标题: ### Heading
        if (trimmed.startsWith("### ")) {
          const text = trimmed.slice(4).trim();
          return (
            <h3
              key={idx}
              id={slugifyHeading(text)}
              className="text-base font-semibold text-zinc-900 dark:text-zinc-100 pt-2 scroll-mt-24"
            >
              {text}
            </h3>
          );
        }

        // 四级标题: #### Heading
        if (trimmed.startsWith("#### ")) {
          const text = trimmed.slice(5).trim();
          return (
            <h4
              key={idx}
              id={slugifyHeading(text)}
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 pt-1.5 scroll-mt-24"
            >
              {text}
            </h4>
          );
        }

        // 代码块: ```lang
        if (trimmed.startsWith("```")) {
          const lines = trimmed.split("\n");
          const lang = lines[0].replace("```", "").trim() || "code";
          const code = lines.slice(1, -1).join("\n");
          const isCopied = copiedIdx === idx;

          return (
            <div
              key={idx}
              className="my-4 rounded-xl bg-zinc-900 dark:bg-black border border-zinc-800 text-zinc-200 text-xs font-mono overflow-hidden"
            >
              <div className="px-3.5 py-2 bg-zinc-800/60 dark:bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <span>{lang}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(code, idx)}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>复制</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // 表格: | col1 | col2 |
        if (trimmed.startsWith("|")) {
          const rows = trimmed
            .split("\n")
            .filter((r) => r.trim().startsWith("|"));
          if (rows.length >= 2) {
            const parseRow = (row: string) =>
              row
                .split("|")
                .slice(1, -1)
                .map((cell) => cell.trim());
            const headers = parseRow(rows[0]);
            const bodyRows = rows.slice(2).map(parseRow);
            return (
              <div
                key={idx}
                className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <table className="w-full text-xs sm:text-[13px] text-left tabular-nums">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold">
                    <tr>
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-4 py-2.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {bodyRows.map((cells, rIdx) => (
                      <tr key={rIdx}>
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap">
                            {renderInlineMarkdown(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 列表: - item 或 1. item
        if (trimmed.startsWith("- ") || /^\d+\.\s/.test(trimmed)) {
          const lines = trimmed.split("\n");
          const isOrdered = /^\d+\.\s/.test(trimmed);
          return (
            <ul key={idx} className="space-y-2 pl-1">
              {lines.map((line, lIdx) => {
                const clean = isOrdered
                  ? line.replace(/^\d+\.\s*/, "")
                  : line.replace(/^-\s*/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-xs font-mono text-zinc-400 mt-1 shrink-0 tabular-nums">
                      {isOrdered ? `${lIdx + 1}.` : "•"}
                    </span>
                    <span>{renderInlineMarkdown(clean)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 独立数学公式: $$formula$$
        if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
          return (
            <div
              key={idx}
              className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-center font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200"
            >
              {formatFormulaText(trimmed)}
            </div>
          );
        }

        // 常规段落
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

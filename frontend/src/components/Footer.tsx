"use client";

import React, { useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { GithubIcon } from "./icons";
import { BaoCoreLogo } from "./BaoCoreLogo";
import { AUTHOR_EMAIL, GITHUB_URL } from "@/lib/siteConfig";
import { copyTextToClipboard } from "@/lib/utils";

export function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    const success = await copyTextToClipboard(AUTHOR_EMAIL);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <footer className="py-10 pb-[calc(env(safe-area-inset-bottom)+28px)] border-t border-zinc-200 dark:border-zinc-800 max-w-6xl mx-auto w-full px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2.5 tabular-nums">
          <span className="w-5 h-5 rounded-md bg-white border border-zinc-200/90 dark:border-zinc-700/60 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden p-0.5">
            <BaoCoreLogo className="w-4 h-4" />
          </span>
          <span className="text-zinc-700 dark:text-zinc-300 font-semibold tracking-tight">
            苦恼的肉包 · Roubao
          </span>
          <span className="font-mono tabular-nums">© 2026</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          {/* 完整邮箱展示 + 一键复制/发送 */}
          <div className="inline-flex items-center gap-1 font-mono text-[11px] sm:text-xs">
            <a
              href={`mailto:${AUTHOR_EMAIL}`}
              title="点击发送邮件"
              className="hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1.5 py-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>{AUTHOR_EMAIL}</span>
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              title="复制完整邮箱"
              aria-label="复制完整邮箱"
              className="hit-budget-44 -mr-2 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer ios-pressable"
            >
              <span className="w-6 h-6 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800">
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
          </div>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1.5 font-sans py-1.5 ios-pressable"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

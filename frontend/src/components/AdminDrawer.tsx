"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { Article } from "@/types";
import { useSpringSheet } from "@/lib/useSpringSheet";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddArticle: (newArticle: Article) => void;
}

export function AdminDrawer({ isOpen, onClose, onAddArticle }: AdminDrawerProps) {
  const { isMounted, isVisible } = useSpringSheet({
    isOpen,
    durationMs: 460,
  });

  const [token, setToken] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [contentUrl, setContentUrl] = useState<string>(
    "https://cdn.roubao.dev/posts/2026/my-new-post.md"
  );
  const [category, setCategory] = useState<
    "backend" | "frontend" | "architecture" | "performance"
  >("backend");
  const [tags, setTags] = useState<string>("Java 21, Spring Boot");
  const [summary, setSummary] = useState<string>("");
  const [sampleContent, setSampleContent] = useState<string>(
    "# 新文章标题\n\n正文内容..."
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!token.trim()) {
      setErrorMsg("请输入 Admin Token");
      return;
    }

    if (!title.trim() || !slug.trim() || !summary.trim()) {
      setErrorMsg("请完整填写标题、别名(Slug)与摘要，或直接选择 .md 文件");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        const frontmatter = `---
title: "${title.trim()}"
slug: "${slug.trim()}"
category: "${category}"
tags: ${JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean))}
summary: "${summary.trim()}"
---
${sampleContent}
`;
        const blob = new Blob([frontmatter], { type: "text/markdown" });
        formData.append("file", blob, `${slug.trim() || "article"}.md`);
      }

      const response = await fetch("/api/v1/admin/articles/upload", {
        method: "POST",
        headers: {
          "X-Admin-Token": token.trim(),
        },
        body: formData,
      });

      const payload = (await response.json()) as {
        code?: number;
        message?: string;
        data?: number;
      };

      if (!response.ok || payload.code !== 0) {
        setErrorMsg(payload.message ?? "保存失败，请检查输入或 Token");
        return;
      }

      const newArticle: Article = {
        id: String(payload.data || Date.now()),
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        contentUrl: contentUrl.trim(),
        fileType: "md",
        category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        views: 0,
        likeCount: 0,
        readTimeMinutes: Math.max(1, Math.ceil(sampleContent.length / 400)),
        publishedAt: new Date().toISOString().slice(0, 10),
        contentMarkdown: sampleContent,
      };

      onAddArticle(newArticle);
      setSelectedFile(null);
      setTitle("");
      setSlug("");
      setSummary("");
      setSampleContent("# 新文章标题\n\n正文内容...");
      setSuccessMsg("已持久化保存并同步至文章列表");

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 900);
    } catch {
      setErrorMsg("网络请求失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-drawer-title"
    >
      <div
        style={{ transition: "opacity 420ms ease-out" }}
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        style={{
          transform: isVisible ? "translate3d(0, 0, 0)" : "translate3d(100%, 0, 0)",
          transition: "transform 460ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="relative w-full max-w-md h-full bg-white dark:bg-[#121214] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10"
      >
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3
              id="admin-drawer-title"
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
            >
              录入文章
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              录入元数据并挂载 CDN 链接
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭控制台"
            className="hit-budget-44 -mr-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer ios-pressable"
          >
            <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Admin Token
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="请输入服务端 ADMIN_TOKEN"
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-xs"
              />
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                直接选择 Markdown 文件导入 (.md)
              </label>
              <input
                type="file"
                accept=".md,.markdown"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                    if (!title) setTitle(nameWithoutExt);
                    if (!slug) setSlug(nameWithoutExt.toLowerCase().replace(/[^a-z0-9_-]/g, "-"));
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (content) {
                        setSampleContent(content);
                        if (!summary) {
                          const clean = content.replace(/#+\s+.*/g, "").trim();
                          setSummary(clean.slice(0, 100) + (clean.length > 100 ? "..." : ""));
                        }
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-zinc-200 dark:file:bg-zinc-700 file:text-zinc-800 dark:file:text-zinc-200 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                支持解析 Frontmatter 元数据 (title, slug, category, tags)
              </p>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：Netty 虚拟线程长连接实践"
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                URL Slug 别名
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="例如：netty-virtual-threads"
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                云存储 CDN 文件地址 (content_url)
              </label>
              <input
                type="text"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  分类
                </label>
                <select
                  value={category}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCategory(
                      e.target.value as "backend" | "frontend" | "architecture" | "performance"
                    )
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="backend">后端</option>
                  <option value="architecture">架构</option>
                  <option value="frontend">前端</option>
                  <option value="performance">性能</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  标签 (逗号分隔)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                摘要
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="简短说明..."
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 resize-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Markdown 正文
              </label>
              <textarea
                rows={4}
                value={sampleContent}
                onChange={(e) => setSampleContent(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-[11px]"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="tactile-btn w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white dark:bg-white dark:text-zinc-900 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "保存中..." : "确认保存"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

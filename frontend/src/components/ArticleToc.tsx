"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { TocHeading } from "@/lib/markdown";

interface ArticleTocProps {
  headings: TocHeading[];
  variant: "mobile" | "desktop";
}

export function ArticleToc({ headings, variant }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        rootMargin: "-96px 0px -65% 0px",
        threshold: 0,
      }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  const handleJump = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    setActiveId(id);
    setMobileOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  if (variant === "mobile") {
    return (
      <div className="lg:hidden mb-6">
        <div className="clean-card rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              <List className="w-3.5 h-3.5 text-zinc-400" />
              <span>文章目录</span>
              <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                ({headings.length})
              </span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                mobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {mobileOpen && (
            <nav
              aria-label="文章目录"
              className="px-4 pb-3 pt-1 border-t border-zinc-100 dark:border-zinc-800 space-y-1"
            >
              {headings.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleJump(e, item.id)}
                    className={`block py-1 text-xs transition-colors ${
                      item.level === 3 ? "pl-3" : ""
                    } ${
                      isActive
                        ? "text-zinc-950 dark:text-zinc-50 font-semibold"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    {item.text}
                  </a>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden lg:block lg:sticky lg:top-24">
      <nav
        aria-label="文章目录"
        className="clean-card rounded-2xl p-4 space-y-3"
      >
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <span className="inline-flex items-center gap-1.5">
            <List className="w-3.5 h-3.5 text-zinc-400" />
            <span>目录</span>
          </span>
          <span className="font-mono text-[11px] font-normal text-zinc-400 tabular-nums">
            {headings.length} 节
          </span>
        </div>

        <ul className="space-y-1">
          {headings.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleJump(e, item.id)}
                  className={`block py-1 text-xs leading-snug transition-colors border-l-2 ${
                    item.level === 3 ? "pl-5" : "pl-2.5"
                  } ${
                    isActive
                      ? "border-zinc-900 dark:border-zinc-100 text-zinc-950 dark:text-zinc-50 font-medium"
                      : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

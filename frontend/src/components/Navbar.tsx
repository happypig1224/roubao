"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun, Search, X, FileText, FolderGit2 } from "lucide-react";
import { GithubIcon } from "./icons";
import { BaoCoreLogo } from "./BaoCoreLogo";
import { GITHUB_URL, SITE_BRAND_NAME } from "@/lib/siteConfig";
import { Article, Project } from "@/types";

export type SectionId = "top" | "projects" | "blog";

interface NavbarProps {
  activeSection: SectionId;
  articles: Article[];
  projects: Project[];
  onSelectArticle?: (article: Article) => void;
}

const THEME_EVENT = "roubao-theme-change";

function subscribeTheme(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot() {
  return false;
}

export function Navbar({
  activeSection,
  articles,
  projects,
  onSelectArticle,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  // Cmd/Ctrl + K focuses the inline navbar search input directly
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const navItems: { id: SectionId; href: string; label: string }[] = [
    { id: "top", href: "/#top", label: "概览" },
    { id: "projects", href: "/#projects", label: "项目" },
    { id: "blog", href: "/#blog", label: "文章" },
  ];

  const trimmed = searchQuery.trim().toLowerCase();
  const matchedArticles = trimmed
    ? articles.filter(
        (art) =>
          art.title.toLowerCase().includes(trimmed) ||
          art.summary.toLowerCase().includes(trimmed) ||
          art.tags.some((t) => t.toLowerCase().includes(trimmed))
      )
    : [];
  const matchedProjects = trimmed
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.tagline.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed) ||
          p.techTags.some((t) => t.toLowerCase().includes(trimmed))
      )
    : [];

  type SearchResultItem =
    | { type: "article"; data: Article }
    | { type: "project"; data: Project };

  const flattenedResults: SearchResultItem[] = [
    ...matchedArticles.map((a) => ({ type: "article" as const, data: a })),
    ...matchedProjects.map((p) => ({ type: "project" as const, data: p })),
  ];

  const showDropdown = searchFocused && trimmed.length > 0;

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.type === "article") {
      if (onSelectArticle) {
        onSelectArticle(item.data);
      } else {
        router.push(`/blog/${item.data.slug}`);
      }
    } else if (pathname === "/") {
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#projects");
    }
    setSearchFocused(false);
    setSearchQuery("");
    inputRef.current?.blur();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchFocused(false);
      inputRef.current?.blur();
      return;
    }
    if (!showDropdown || flattenedResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? flattenedResults.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flattenedResults[selectedIndex];
      if (target) handleSelectResult(target);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full clean-nav backdrop-blur-xl backdrop-saturate-180 bg-[#fafafa]/85 dark:bg-[#0c0c0d]/85 border-b border-zinc-200/80 dark:border-zinc-800/80 pt-[env(safe-area-inset-top)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 md:py-0 md:h-16 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] md:items-center gap-2.5 md:gap-6">
        {/* Top / Left Row: Brand Logo + Mobile Right Actions */}
        <div className="flex items-center justify-between md:justify-start">
          <Link
            href="/#top"
            className="inline-flex items-center gap-2.5 font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-50 tracking-tight hover:opacity-80 transition-opacity shrink-0"
          >
            <span className="w-9 h-9 rounded-xl bg-white border border-zinc-200/90 dark:border-zinc-700/60 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden p-1 transition-transform hover:scale-105">
              <BaoCoreLogo className="w-7 h-7" />
            </span>
            <span>{SITE_BRAND_NAME}</span>
          </Link>

          {/* Mobile-only GitHub + Theme Toggle (Strict HIG 44pt Touch Targets) */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="tactile-btn w-11 h-11 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
            <button
              onClick={toggleTheme}
              className="tactile-btn w-11 h-11 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label={isDark ? "切换浅色模式" : "切换深色模式"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Center: One Page Love Dock Navigation (Strict HIG 44pt Touch Targets) */}
        <nav
          aria-label="主导航"
          className="flex items-center justify-center gap-2 sm:gap-4 lg:gap-6 text-sm"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative min-h-[44px] min-w-[56px] inline-flex items-center justify-center px-3.5 py-2 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm font-medium ${
                  isActive
                    ? "text-zinc-950 dark:text-zinc-50 font-semibold bg-zinc-200/70 dark:bg-zinc-800/80 shadow-2xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Inline Search Input + GitHub + Theme Toggle */}
        <div className="flex items-center justify-end gap-2.5">
          <div ref={searchBoxRef} className="relative w-full md:w-52 lg:w-60">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
                setSearchFocused(true);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="搜索文章或项目..."
              aria-label="搜索文章或项目"
              className="w-full pl-9 pr-10 min-h-[44px] md:min-h-[38px] py-2 text-xs sm:text-[13px] rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="清空搜索"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer ios-pressable"
              >
                <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                  <X className="w-2.5 h-2.5" />
                </span>
              </button>
            )}

            {/* Inline Anchored Results Dropdown (No Modal) */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-full md:w-80 bg-white dark:bg-[#121214] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden z-50">
                {flattenedResults.length === 0 ? (
                  <div className="py-6 px-4 text-center text-xs text-zinc-400">
                    未找到匹配 “{searchQuery}” 的内容
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
                    {flattenedResults.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      if (item.type === "article") {
                        return (
                          <button
                            key={item.data.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectResult(item);
                            }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full px-2.5 py-2 rounded-lg text-left flex items-start gap-2.5 transition-all cursor-pointer ios-pressable ${
                              isSelected
                                ? "bg-zinc-100 dark:bg-zinc-800"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                {item.data.title}
                              </div>
                              <div className="text-[11px] text-zinc-400 truncate">
                                文章 · {item.data.publishedAt}
                              </div>
                            </div>
                          </button>
                        );
                      }
                      return (
                        <button
                          key={item.data.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectResult(item);
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full px-2.5 py-2 rounded-lg text-left flex items-start gap-2.5 transition-all cursor-pointer ios-pressable ${
                            isSelected
                              ? "bg-zinc-100 dark:bg-zinc-800"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <FolderGit2 className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {item.data.name}
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate">
                              项目 · {item.data.tagline}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop GitHub + Theme Toggle */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="tactile-btn p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <GithubIcon className="w-5 h-5" />
            </a>

            <button
              onClick={toggleTheme}
              className="tactile-btn p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label={isDark ? "切换浅色模式" : "切换深色模式"}
              title={isDark ? "切换浅色模式" : "切换深色模式"}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

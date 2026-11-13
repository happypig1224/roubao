"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 当页面下滑超过一个视口高度时展示
      setVisible(window.scrollY > window.innerHeight);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="返回顶部"
      title="返回顶部"
      className={`fixed right-5 sm:right-8 bottom-[calc(env(safe-area-inset-bottom)+24px)] z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-white/45 dark:bg-zinc-900/45 hover:bg-white/75 dark:hover:bg-zinc-900/75 backdrop-blur-md border border-zinc-900/8 dark:border-white/10 hover:border-zinc-900/15 dark:hover:border-white/20 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 cursor-pointer active:scale-90 ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
    </button>
  );
}


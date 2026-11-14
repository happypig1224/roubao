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
      className={`fixed right-5 sm:right-8 bottom-[calc(env(safe-area-inset-bottom)+24px)] z-40 w-11 h-11 rounded-full flex items-center justify-center bg-white/75 dark:bg-[#1c1c1e]/75 hover:bg-white/90 dark:hover:bg-[#1c1c1e]/90 backdrop-blur-[20px] saturate-[185%] border-t border-white/90 dark:border-white/15 border-b border-black/[0.06] dark:border-black/40 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer ios-pressable select-none ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2]" />
    </button>
  );
}


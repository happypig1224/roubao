"use client";

import { useEffect, useState } from "react";

interface UseSpringSheetOptions {
  isOpen: boolean;
  durationMs?: number;
  onExited?: () => void;
}

/**
 * Apple-grade Mount & Visible lifecycle hook for drawers/sheets:
 * - Mounts offscreen (visible=false) on frame 0
 * - Transitions to visible=true after 20ms frame separation
 * - Keeps DOM mounted for durationMs (default 460ms) while sliding out on close
 */
export function useSpringSheet({
  isOpen,
  durationMs = 460,
  onExited,
}: UseSpringSheetOptions) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  if (isOpen && !isMounted) {
    setIsMounted(true);
  }

  useEffect(() => {
    if (isOpen) {
      const frameTimer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(frameTimer);
    }

    if (isMounted) {
      const unmountTimer = setTimeout(() => {
        setIsVisible(false);
        setIsMounted(false);
        onExited?.();
      }, durationMs);
      return () => clearTimeout(unmountTimer);
    }
  }, [isOpen, isMounted, durationMs, onExited]);

  return {
    isMounted,
    isVisible: isOpen && isVisible,
  };
}


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
    let frameId: number | null = null;
    let timerId: NodeJS.Timeout | null = null;

    if (isOpen) {
      frameId = requestAnimationFrame(() => {
        timerId = setTimeout(() => {
          setIsVisible(true);
        }, 20);
      });
    } else if (isMounted) {
      timerId = setTimeout(() => {
        setIsVisible(false);
        setIsMounted(false);
        onExited?.();
      }, durationMs);
    }

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      if (timerId !== null) clearTimeout(timerId);
    };
  }, [isOpen, isMounted, durationMs, onExited]);

  return {
    isMounted,
    isVisible: isOpen && isVisible,
  };
}


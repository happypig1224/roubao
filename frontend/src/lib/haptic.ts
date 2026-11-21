/**
 * Apple HIG 触觉反馈分级系统 (Haptic Hierarchy)
 * 基于 Web Vibration API，分级提供微触觉反馈，移动端/支持设备温润响应，未支持环境静默回退
 */
export type HapticType =
  | "selection" // 微弱咔哒 (5ms)
  | "light"     // 轻微吸附/切换 (10ms)
  | "medium"    // 明确确认 (20ms)
  | "success"   // 愉悦双振 ([10, 30, 15]ms)
  | "warning";  // 阻尼警告 ([30, 50, 30]ms)

export function triggerHaptic(type: HapticType = "light"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }
  try {
    switch (type) {
      case "selection":
        navigator.vibrate?.(5);
        break;
      case "light":
        navigator.vibrate?.(10);
        break;
      case "medium":
        navigator.vibrate?.(20);
        break;
      case "success":
        navigator.vibrate?.([10, 30, 15]);
        break;
      case "warning":
        navigator.vibrate?.([30, 50, 30]);
        break;
    }
  } catch {
    // 忽略特定 WebView 或隐私权限受限错误
  }
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { verifyAdminToken } from "@/lib/adminApi";

interface AdminAuthModalProps {
  isOpen: boolean;
  onSuccess: (token: string) => void;
}

/**
 * 后台身份认证与 Token 鉴权弹窗
 *
 * @author roubao
 * @since 2026-11-16
 */
export function AdminAuthModal({ isOpen, onSuccess }: AdminAuthModalProps) {
  const [inputToken, setInputToken] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = inputToken.trim();
    if (!token) {
      setErrorMsg("请输入管理员安全凭证 (Admin Token)");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const isValid = await verifyAdminToken(token);
      if (isValid) {
        onSuccess(token);
      } else {
        setErrorMsg("安全凭证无效或未通过服务端鉴权校验");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "连接服务端失败，请检查服务状态";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 id="auth-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            管理员凭证解锁
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
            此区域仅限博主与运维管理人员访问，请输入配置的 <code className="text-zinc-700 dark:text-zinc-300 font-mono">ADMIN_TOKEN</code>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Admin Secret Token
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                autoComplete="current-password"
                value={inputToken}
                onChange={(e) => {
                  setInputToken(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="例如: roubao-admin-secret-token"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="tactile-btn w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white dark:bg-white dark:text-zinc-900 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <span className="inline-block animate-spin mr-1">⏳</span>
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{isLoading ? "验证身份中..." : "解锁后台控制台"}</span>
            {!isLoading && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            ← 返回前台主页
          </Link>
        </div>
      </div>
    </div>
  );
}

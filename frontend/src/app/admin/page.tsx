"use client";

import React, { useEffect, useState } from "react";
import { AdminAuthModal } from "@/components/admin/AdminAuthModal";
import { AdminNavbar, AdminTab } from "@/components/admin/AdminNavbar";
import { DashboardView } from "@/components/admin/DashboardView";
import { ArticlesView } from "@/components/admin/ArticlesView";
import { CategoriesView } from "@/components/admin/CategoriesView";
import { ProjectsView } from "@/components/admin/ProjectsView";
import { verifyAdminToken } from "@/lib/adminApi";

const STORAGE_KEY = "roubao_admin_token";

/**
 * 后台管理控制台根页面
 *
 * @author roubao
 * @since 2026-11-16
 */
export default function AdminPage() {
  const [token, setToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // Quick Action Jump flags
  const [articleInitialAction, setArticleInitialAction] = useState<"new" | "upload" | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      const savedToken = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
      if (savedToken) {
        try {
          const valid = await verifyAdminToken(savedToken);
          if (isMounted) {
            if (valid) {
              setToken(savedToken);
              setIsAuthenticated(true);
            } else {
              sessionStorage.removeItem(STORAGE_KEY);
            }
          }
        } catch {
          if (isMounted) {
            sessionStorage.removeItem(STORAGE_KEY);
          }
        }
      }
      if (isMounted) {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthSuccess = (validToken: string) => {
    sessionStorage.setItem(STORAGE_KEY, validToken);
    setToken(validToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setToken("");
    setIsAuthenticated(false);
    setActiveTab("dashboard");
  };

  // Quick actions from dashboard
  const handleOpenArticleEditorFromDashboard = () => {
    setArticleInitialAction("new");
    setActiveTab("articles");
  };

  const handleOpenMarkdownUploadFromDashboard = () => {
    setArticleInitialAction("upload");
    setActiveTab("articles");
  };

  const handleTabChange = (tab: AdminTab) => {
    if (tab !== "articles") {
      setArticleInitialAction(null);
    }
    setActiveTab(tab);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-400 text-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
          <span>验证管理员会话凭证中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0c0e]">
      {/* Auth Modal if unauthenticated */}
      <AdminAuthModal
        isOpen={!isAuthenticated}
        onSuccess={handleAuthSuccess}
      />

      {isAuthenticated && (
        <>
          {/* Top Admin Navbar */}
          <AdminNavbar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
          />

          {/* Main Workspace Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {activeTab === "dashboard" && (
              <DashboardView
                token={token}
                onNavigateTab={handleTabChange}
                onOpenArticleEditor={handleOpenArticleEditorFromDashboard}
                onOpenMarkdownUpload={handleOpenMarkdownUploadFromDashboard}
              />
            )}

            {activeTab === "articles" && (
              <ArticlesView
                token={token}
                initialAction={articleInitialAction}
              />
            )}

            {activeTab === "categories" && (
              <CategoriesView token={token} />
            )}

            {activeTab === "projects" && (
              <ProjectsView token={token} />
            )}
          </main>

          {/* Clean Admin Footer */}
          <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-4 px-4 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>Roubao Management Platform • Java 21 LTS & Next.js 16</span>
          </footer>
        </>
      )}
    </div>
  );
}

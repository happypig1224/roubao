"use client";

import React, { useEffect, useState } from "react";
import { FolderTree, Plus, RefreshCw, Edit3, Trash2, X, AlertCircle } from "lucide-react";
import { CategoryPayload, CategoryStats } from "@/types";
import { createAdminCategory, deleteAdminCategory, fetchAdminCategories, updateAdminCategory } from "@/lib/adminApi";

interface CategoriesViewProps {
  token: string;
}

/**
 * 后台分类字典与内容体系管理视图
 *
 * @author roubao
 * @since 2026-11-16
 */
export function CategoriesView({ token }: CategoriesViewProps) {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIcon, setFormIcon] = useState("Folder");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAdminCategories(token);
      setCategories(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "获取分类列表失败";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const data = await fetchAdminCategories(token);
        if (isMounted) setCategories(data);
      } catch (err: unknown) {
        if (isMounted) setErrorMsg(err instanceof Error ? err.message : "获取分类列表失败");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleOpenCreate = () => {
    setEditingCategoryId(null);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormIcon("Folder");
    setFormSortOrder(10);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CategoryStats) => {
    setEditingCategoryId(c.id);
    setFormName(c.categoryName);
    setFormSlug(c.categorySlug);
    setFormDesc(c.description || "");
    setFormIcon(c.iconName || "Folder");
    setFormSortOrder(c.sortOrder || 0);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      setModalError("分类名称与 Slug 别名不能为空");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const payload: CategoryPayload = {
      categoryName: formName.trim(),
      categorySlug: formSlug.trim(),
      description: formDesc.trim(),
      iconName: formIcon.trim(),
      sortOrder: Number(formSortOrder) || 0,
    };

    try {
      if (editingCategoryId) {
        await updateAdminCategory(token, editingCategoryId, payload);
      } else {
        await createAdminCategory(token, payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "保存分类失败";
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: CategoryStats) => {
    if (!window.confirm(`确定要删除分类「${cat.categoryName}」吗？`)) {
      return;
    }

    try {
      await deleteAdminCategory(token, cat.id);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "删除失败";
      alert(msg);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>分类体系管理</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            维护技术领域字典、Slug 路由与文章归类（已具备防误删物理外键约束安全阻断）
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
            title="刷新数据"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增分类</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-xs text-zinc-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            正在加载分类列表...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-zinc-400">
            暂无分类，请点击右上角新增
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-semibold text-xs border border-amber-200/60 dark:border-amber-900/40">
                      {cat.iconName ? cat.iconName.slice(0, 1) : "C"}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {cat.categoryName}
                      </h3>
                      <code className="text-[10px] text-zinc-400 font-mono">
                        /{cat.categorySlug}
                      </code>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                    排序: {cat.sortOrder ?? 0}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 min-h-[32px]">
                  {cat.description || "暂无描述说明"}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  {cat.articleCount ?? 0} 篇文章
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="编辑分类"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title={
                      cat.articleCount && cat.articleCount > 0
                        ? "存在关联文章，受后端安全防线保护禁止直接删除"
                        : "删除分类"
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#161618] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {editingCategoryId ? "编辑分类" : "新增分类"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  分类名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例如: 云原生与架构"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  路由标识 (Slug) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="例如: cloud-native"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    图标标识 (IconName)
                  </label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="例如: Server, Cpu, Boxes"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    排序权重 (倒序越大越前)
                  </label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  分类详细描述说明
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="关于该分类所承载的技术内容范围与方向说明..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="tactile-btn px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "保存中..." : "保存分类"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

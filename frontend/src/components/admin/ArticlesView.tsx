"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Upload,
  RefreshCw,
  Edit3,
  Trash2,
  Pin,
  Sparkles,
  Eye,
  CheckCircle2,
  Clock,
  X,
  FileCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Article, ArticleCreatePayload, ArticleUpdatePayload, CategoryStats, PageResult } from "@/types";
import {
  createAdminArticle,
  deleteAdminArticle,
  fetchAdminArticleDetail,
  fetchAdminArticles,
  fetchAdminCategories,
  toggleArticleFeatured,
  toggleArticleTop,
  updateAdminArticle,
  updateArticlePublishStatus,
  uploadMarkdownArticleDirect,
} from "@/lib/adminApi";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface ArticlesViewProps {
  token: string;
  initialAction?: "new" | "upload" | null;
}

/**
 * 后台文章管理与内容发布工作台
 *
 * @author roubao
 * @since 2026-11-16
 */
export function ArticlesView({
  token,
  initialAction = null,
}: ArticlesViewProps) {
  const [articlesPage, setArticlesPage] = useState<PageResult<Article> | null>(null);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "published" | "draft">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(initialAction === "new");
  const [editingArticleId, setEditingArticleId] = useState<number | string | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSubmitting, setEditorSubmitting] = useState(false);
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number>(1);
  const [formTags, setFormTags] = useState("");
  const [formReadTime, setFormReadTime] = useState<number>(5);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formPublished, setFormPublished] = useState<boolean>(true);
  const [formSummary, setFormSummary] = useState("");
  const [formMarkdown, setFormMarkdown] = useState(
    initialAction === "new" ? "# 新文章标题\n\n正文内容从这里开始..." : ""
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(initialAction === "upload");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load Articles
  const loadArticles = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const res = await fetchAdminArticles(token, {
        pageNo: page,
        pageSize: 10,
        keyword: keyword.trim() || undefined,
        categoryId: selectedCategoryId,
        published: selectedStatus === "all" ? undefined : selectedStatus === "published",
      });
      setArticlesPage(res);
      setCurrentPage(page);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingArticleId(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategoryId(categories[0]?.id ?? 1);
    setFormTags("");
    setFormReadTime(5);
    setFormSortOrder(0);
    setFormPublished(true);
    setFormSummary("");
    setFormMarkdown("# 新文章标题\n\n正文内容从这里开始...");
    setFormError(null);
    setEditorTab("edit");
    setIsEditorOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const [cats, pageRes] = await Promise.all([
          fetchAdminCategories(token).catch(() => []),
          fetchAdminArticles(token, { pageNo: 1, pageSize: 10 }).catch(() => null),
        ]);
        if (isMounted) {
          if (cats && cats.length > 0) {
            setCategories(cats);
            setFormCategoryId(cats[0].id);
          }
          if (pageRes) {
            setArticlesPage(pageRes);
            setCurrentPage(1);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadArticles(1);
  };

  // Open Edit
  const handleOpenEdit = async (article: Article) => {
    setEditingArticleId(article.id);
    setEditorLoading(true);
    setFormError(null);
    setIsEditorOpen(true);
    setEditorTab("edit");

    try {
      const detail = await fetchAdminArticleDetail(token, article.id);
      setFormTitle(detail.title || "");
      setFormSlug(detail.slug || "");
      setFormCategoryId(detail.categoryId || categories[0]?.id || 1);
      setFormTags(Array.isArray(detail.tags) ? detail.tags.join(", ") : "");
      setFormReadTime(detail.readTimeMinutes || 5);
      setFormSortOrder(0);
      setFormPublished(detail.published ?? true);
      setFormSummary(detail.summary || "");
      setFormMarkdown(detail.contentMarkdown || "");
    } catch {
      setFormError("加载文章详情失败");
    } finally {
      setEditorLoading(false);
    }
  };

  // Submit Article (Create or Update)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSlug.trim() || !formMarkdown.trim()) {
      setFormError("请完整填写标题、Slug 与 Markdown 正文");
      return;
    }

    setEditorSubmitting(true);
    setFormError(null);

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingArticleId) {
        const payload: ArticleUpdatePayload = {
          categoryId: formCategoryId,
          title: formTitle.trim(),
          slug: formSlug.trim(),
          summary: formSummary.trim(),
          tags: tagsArray,
          readTimeMinutes: Number(formReadTime) || 5,
          sortOrder: Number(formSortOrder) || 0,
          published: formPublished,
          contentMarkdown: formMarkdown,
        };
        await updateAdminArticle(token, editingArticleId, payload);
      } else {
        const payload: ArticleCreatePayload = {
          categoryId: formCategoryId,
          title: formTitle.trim(),
          slug: formSlug.trim(),
          summary: formSummary.trim(),
          tags: tagsArray,
          readTimeMinutes: Number(formReadTime) || 5,
          sortOrder: Number(formSortOrder) || 0,
          published: formPublished,
          contentMarkdown: formMarkdown,
        };
        await createAdminArticle(token, payload);
      }

      setIsEditorOpen(false);
      loadArticles(currentPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "保存文章失败";
      setFormError(msg);
    } finally {
      setEditorSubmitting(false);
    }
  };

  // Toggle Top
  const handleToggleTop = async (id: number | string) => {
    try {
      await toggleArticleTop(token, id);
      loadArticles(currentPage);
    } catch {
      // ignore
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (id: number | string) => {
    try {
      await toggleArticleFeatured(token, id);
      loadArticles(currentPage);
    } catch {
      // ignore
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (id: number | string, currentPublished: boolean) => {
    try {
      await updateArticlePublishStatus(token, id, !currentPublished);
      loadArticles(currentPage);
    } catch {
      // ignore
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: number | string, title: string) => {
    if (!window.confirm(`确定要删除文章「${title}」吗？此操作不可逆。`)) {
      return;
    }
    try {
      await deleteAdminArticle(token, id);
      loadArticles(currentPage);
    } catch {
      alert("删除文章失败");
    }
  };

  // Handle Markdown Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadMessage(null);

    try {
      const newId = await uploadMarkdownArticleDirect(token, uploadFile);
      setUploadMessage({
        type: "success",
        text: `导入成功！生成文章 ID: ${newId}，已自动解析 Frontmatter 元数据并入库。`,
      });
      setUploadFile(null);
      loadArticles(1);
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadMessage(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "上传导入失败";
      setUploadMessage({ type: "error", text: msg });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Actions Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>文章内容库管理</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              支持全量状态检索、Markdown 语法双向编辑、置顶推荐与一键上下线发布
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>导入 Markdown</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>撰写新文章</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索标题、摘要或关键词..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCategoryId ?? ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : undefined;
                setSelectedCategoryId(val);
              }}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="">全部分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName} ({c.articleCount ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as "all" | "published" | "draft")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">仅草稿</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center gap-1.5">
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer text-center"
            >
              筛选
            </button>
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setSelectedCategoryId(undefined);
                setSelectedStatus("all");
                loadArticles(1);
              }}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
              title="重置并刷新"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Articles Table Card */}
      <div className="rounded-2xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="py-3 px-4 font-medium">文章标题 / 路由 Slug</th>
                <th className="py-3 px-3 font-medium">所属分类</th>
                <th className="py-3 px-3 font-medium">发布状态</th>
                <th className="py-3 px-3 font-medium">置顶 / 推荐</th>
                <th className="py-3 px-3 font-medium">阅读量</th>
                <th className="py-3 px-3 font-medium">发布日期</th>
                <th className="py-3 px-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                    正在加载文章数据...
                  </td>
                </tr>
              ) : !articlesPage || articlesPage.list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    暂无匹配的文章记录，点击上方「撰写新文章」开启第一篇分享
                  </td>
                </tr>
              ) : (
                articlesPage.list.map((article) => {
                  const isPub = article.published !== false;
                  return (
                    <tr
                      key={article.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      {/* Title & Slug */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {article.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400 font-mono truncate">
                          <span>/{article.slug}</span>
                          {article.tags && article.tags.length > 0 && (
                            <span className="text-[10px] text-zinc-500 font-sans">
                              • {article.tags.slice(0, 3).join(", ")}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
                          {article.categoryName || article.category}
                        </span>
                      </td>

                      {/* Published Badge & Toggle */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleTogglePublish(article.id, isPub)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                            isPub
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                          }`}
                          title="点击切换发布状态"
                        >
                          {isPub ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>已发布</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>草稿</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Top & Featured */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleTop(article.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              article.top
                                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300"
                            }`}
                            title={article.top ? "取消置顶" : "设为置顶"}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(article.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              article.featured
                                ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                                : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300"
                            }`}
                            title={article.featured ? "取消精选推荐" : "设为精选推荐"}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Views */}
                      <td className="py-3.5 px-3 font-mono text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-zinc-400" />
                          <span>{article.views ?? 0}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-zinc-500 font-mono text-[11px]">
                        {article.publishedAt ? article.publishedAt.slice(0, 10) : "-"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(article)}
                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                            title="编辑文章正文与元数据"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id, article.title)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="删除文章"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {articlesPage && articlesPage.totalPages > 1 && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              共 {articlesPage.total} 篇文章，当前第 {currentPage} / {articlesPage.totalPages} 页
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1 || isLoading}
                onClick={() => loadArticles(currentPage - 1)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentPage >= articlesPage.totalPages || isLoading}
                onClick={() => loadArticles(currentPage + 1)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#161618] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingArticleId ? "编辑文章" : "撰写新文章"}
                </h2>
                {/* Edit vs Preview Toggle */}
                <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditorTab("edit")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      editorTab === "edit"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    Markdown 编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      editorTab === "preview"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    实时排版预览
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {editorLoading ? (
                <div className="py-20 text-center text-xs text-zinc-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-400" />
                  加载详情中...
                </div>
              ) : (
                <form id="article-form" onSubmit={handleSaveArticle} className="space-y-4 text-xs">
                  {formError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400">
                      {formError}
                    </div>
                  )}

                  {/* Row 1: Title & Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        文章标题 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => {
                          setFormTitle(e.target.value);
                          if (!editingArticleId && !formSlug) {
                            setFormSlug(
                              e.target.value
                                .toLowerCase()
                                .trim()
                                .replace(/[^a-z0-9_-]/g, "-")
                            );
                          }
                        }}
                        placeholder="例如: Java 21 虚拟线程压测踩坑"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        路由别名 (Slug) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="例如: java-21-virtual-threads"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                      />
                    </div>
                  </div>

                  {/* Row 2: Category, Tags, Read Time, Publish Status */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        所属分类 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        技术标签 (逗号分隔)
                      </label>
                      <input
                        type="text"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        placeholder="Java 21, Spring Boot"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        预计阅读分钟
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={formReadTime}
                        onChange={(e) => setFormReadTime(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        发布状态
                      </label>
                      <select
                        value={formPublished ? "true" : "false"}
                        onChange={(e) => setFormPublished(e.target.value === "true")}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                      >
                        <option value="true">公开发布 (Published)</option>
                        <option value="false">存为草稿 (Draft)</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      导读摘要 (Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      placeholder="简洁精炼的技术背景与核心结论说明..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
                    />
                  </div>

                  {/* Markdown Editor or Preview */}
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      正文内容 (Markdown) <span className="text-red-500">*</span>
                    </label>
                    {editorTab === "edit" ? (
                      <textarea
                        rows={16}
                        required
                        value={formMarkdown}
                        onChange={(e) => setFormMarkdown(e.target.value)}
                        placeholder="支持标准 GFM Markdown 语法、代码高亮、表格与 Mermaid 语法..."
                        className="w-full px-3.5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs leading-relaxed"
                      />
                    ) : (
                      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] max-h-[500px] overflow-y-auto">
                        <MarkdownRenderer content={formMarkdown || "*暂无正文内容*"} />
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                form="article-form"
                disabled={editorSubmitting}
                className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium cursor-pointer disabled:opacity-60"
              >
                {editorSubmitting ? "正在保存..." : "确认提交保存"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Markdown Modal */}
      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#161618] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  导入 Markdown 文件
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              支持上传标准的 <code>.md</code> 文件，自动解析 Frontmatter 中的 title, slug, category 与 tags 元数据并写入数据库。
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:border-zinc-400 transition-colors">
                <input
                  type="file"
                  id="md-file-input"
                  accept=".md,.markdown"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="md-file-input"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {uploadFile ? uploadFile.name : "点击选择或拖拽 .md 文件至此"}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    支持 .md / .markdown 格式文档
                  </span>
                </label>
              </div>

              {uploadMessage && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    uploadMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                      : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900"
                  }`}
                >
                  {uploadMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={!uploadFile || uploadLoading}
                className="tactile-btn w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {uploadLoading ? "正在解析导入..." : "确认解析并上传入库"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

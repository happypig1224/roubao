"use client";

import React, { useEffect, useState } from "react";
import {
  Boxes,
  Plus,
  RefreshCw,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Star,
  Sparkles,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageResult, Project, ProjectCreatePayload, ProjectUpdatePayload } from "@/types";
import {
  createAdminProject,
  deleteAdminProject,
  fetchAdminProjectDetail,
  fetchAdminProjects,
  updateAdminProject,
} from "@/lib/adminApi";
import { GithubIcon } from "@/components/icons";

interface ProjectsViewProps {
  token: string;
}

/**
 * 后台开源展厅与极客项目管理视图
 *
 * @author roubao
 * @since 2026-11-16
 */
export function ProjectsView({ token }: ProjectsViewProps) {
  const [projectsPage, setProjectsPage] = useState<PageResult<Project> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | string | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formHighlights, setFormHighlights] = useState("");
  const [formTechTags, setFormTechTags] = useState("");
  const [formRepoUrl, setFormRepoUrl] = useState("");
  const [formDemoUrl, setFormDemoUrl] = useState("");
  const [formStarCount, setFormStarCount] = useState<number>(0);
  const [formMetrics, setFormMetrics] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formFeatured, setFormFeatured] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async (page = currentPage) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAdminProjects(token, {
        pageNo: page,
        pageSize: 8,
        keyword: keyword.trim() || undefined,
      });
      setProjectsPage(data);
      setCurrentPage(page);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "获取项目列表失败";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const data = await fetchAdminProjects(token, {
          pageNo: 1,
          pageSize: 8,
        });
        if (isMounted) {
          setProjectsPage(data);
          setCurrentPage(1);
        }
      } catch (err: unknown) {
        if (isMounted) setErrorMsg(err instanceof Error ? err.message : "获取项目列表失败");
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
    loadData(1);
  };

  const handleOpenCreate = () => {
    setEditingProjectId(null);
    setFormName("");
    setFormSlug("");
    setFormTagline("");
    setFormDesc("");
    setFormHighlights("");
    setFormTechTags("");
    setFormRepoUrl("");
    setFormDemoUrl("");
    setFormStarCount(0);
    setFormMetrics("");
    setFormSortOrder(100);
    setFormFeatured(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (project: Project) => {
    setEditingProjectId(project.id);
    setModalError(null);
    setIsModalOpen(true);

    try {
      const detail = await fetchAdminProjectDetail(token, project.id);
      setFormName(detail.name || detail.projectName || "");
      setFormSlug(detail.slug || "");
      setFormTagline(detail.tagline || "");
      setFormDesc(detail.description || "");
      setFormHighlights(
        Array.isArray(detail.architectureHighlights) ? detail.architectureHighlights.join("\n") : ""
      );
      setFormTechTags(Array.isArray(detail.techTags) ? detail.techTags.join(", ") : "");
      setFormRepoUrl(detail.repoUrl || "");
      setFormDemoUrl(detail.demoUrl || "");
      setFormStarCount(detail.stars ?? detail.starCount ?? 0);
      setFormMetrics(detail.metricsSummary ?? detail.metrics ?? "");
      setFormSortOrder(detail.sortOrder ?? 0);
      setFormFeatured(Boolean(detail.featured));
    } catch {
      setModalError("加载项目详情失败");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim() || !formRepoUrl.trim()) {
      setModalError("项目名称、Slug 别名与 GitHub 仓库地址不能为空");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const highlightsArray = formHighlights
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    const techTagsArray = formTechTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingProjectId) {
        const payload: ProjectUpdatePayload = {
          projectName: formName.trim(),
          slug: formSlug.trim(),
          tagline: formTagline.trim(),
          description: formDesc.trim(),
          architectureHighlights: highlightsArray,
          techTags: techTagsArray,
          repoUrl: formRepoUrl.trim(),
          demoUrl: formDemoUrl.trim() || undefined,
          starCount: Number(formStarCount) || 0,
          metricsSummary: formMetrics.trim(),
          sortOrder: Number(formSortOrder) || 0,
          featured: formFeatured,
        };
        await updateAdminProject(token, editingProjectId, payload);
      } else {
        const payload: ProjectCreatePayload = {
          projectName: formName.trim(),
          slug: formSlug.trim(),
          tagline: formTagline.trim(),
          description: formDesc.trim(),
          architectureHighlights: highlightsArray,
          techTags: techTagsArray,
          repoUrl: formRepoUrl.trim(),
          demoUrl: formDemoUrl.trim() || undefined,
          starCount: Number(formStarCount) || 0,
          metricsSummary: formMetrics.trim(),
          sortOrder: Number(formSortOrder) || 0,
          featured: formFeatured,
        };
        await createAdminProject(token, payload);
      }

      setIsModalOpen(false);
      loadData(currentPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "保存项目失败";
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (proj: Project) => {
    if (!window.confirm(`确定要逻辑删除开源项目「${proj.name || proj.projectName}」吗？`)) {
      return;
    }

    try {
      await deleteAdminProject(token, proj.id);
      loadData(currentPage);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "删除失败";
      alert(msg);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>开源展厅项目管理</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              维护前台极客展厅、架构亮点、技术标签与 GitHub 仓库展示
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreate}
              className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增开源项目</span>
            </button>
          </div>
        </div>

        {/* Filter */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索项目名、一句话介绍或架构特点..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="py-2 px-3.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
          >
            搜索
          </button>

          <button
            type="button"
            onClick={() => {
              setKeyword("");
              loadData(1);
            }}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
            title="重置刷新"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-xs text-zinc-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            正在加载项目列表...
          </div>
        ) : !projectsPage || projectsPage.list.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-zinc-400">
            暂无开源项目记录，请点击右上角新增
          </div>
        ) : (
          projectsPage.list.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{proj.name || proj.projectName}</span>
                      {proj.featured && (
                        <span className="p-0.5 rounded text-amber-500" title="首页精选推荐">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </h3>
                    <code className="text-[10px] text-zinc-400 font-mono">
                      /{proj.slug}
                    </code>
                  </div>

                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{proj.stars ?? proj.starCount ?? 0}</span>
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-1 font-medium">
                  {proj.tagline || "暂无一句话介绍"}
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {proj.description || "暂无详细描述"}
                </p>

                {proj.techTags && proj.techTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.techTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="打开 GitHub 仓库"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="打开在线演示"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {proj.metricsSummary && (
                    <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">
                      {proj.metricsSummary}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="编辑项目"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="删除项目"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {projectsPage && projectsPage.totalPages > 1 && (
        <div className="p-3 bg-white dark:bg-[#161618] rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            共 {projectsPage.total} 个项目，当前第 {currentPage} / {projectsPage.totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1 || isLoading}
              onClick={() => loadData(currentPage - 1)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentPage >= projectsPage.totalPages || isLoading}
              onClick={() => loadData(currentPage + 1)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#161618] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {editingProjectId ? "编辑开源项目" : "新增开源项目"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form id="proj-form" onSubmit={handleSave} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      项目名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="例如: Roubao Gateway"
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
                      placeholder="例如: roubao-gateway"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    一句话亮点介绍 (Tagline)
                  </label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="基于 Java 21 虚拟线程与 Netty 实现的高性能网关"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    项目详细描述 (Description)
                  </label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="深入阐述核心解决痛点、架构特色与性能压测表现..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    架构核心亮点 (换行分隔每条)
                  </label>
                  <textarea
                    rows={3}
                    value={formHighlights}
                    onChange={(e) => setFormHighlights(e.target.value)}
                    placeholder="虚拟线程调度替代传统异步回调&#10;Redis 7 + Lua 毫秒级原子限流&#10;全链路 TraceId 透传与 OpenTelemetry"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      GitHub 仓库地址 (Repo URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={formRepoUrl}
                      onChange={(e) => setFormRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      在线演示地址 (Demo URL)
                    </label>
                    <input
                      type="url"
                      value={formDemoUrl}
                      onChange={(e) => setFormDemoUrl(e.target.value)}
                      placeholder="https://demo.example.com"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      技术标签 (逗号分隔)
                    </label>
                    <input
                      type="text"
                      value={formTechTags}
                      onChange={(e) => setFormTechTags(e.target.value)}
                      placeholder="Java 21, Netty"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Star 数量
                    </label>
                    <input
                      type="number"
                      value={formStarCount}
                      onChange={(e) => setFormStarCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      性能指标摘要
                    </label>
                    <input
                      type="text"
                      value={formMetrics}
                      onChange={(e) => setFormMetrics(e.target.value)}
                      placeholder="38K QPS / P99 < 4ms"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      首页精选推荐
                    </label>
                    <select
                      value={formFeatured ? "true" : "false"}
                      onChange={(e) => setFormFeatured(e.target.value === "true")}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                    >
                      <option value="true">是 (Featured)</option>
                      <option value="false">否</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-xs"
              >
                取消
              </button>
              <button
                type="submit"
                form="proj-form"
                disabled={isSubmitting}
                className="tactile-btn px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 font-medium cursor-pointer text-xs disabled:opacity-50"
              >
                {isSubmitting ? "保存中..." : "保存项目"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

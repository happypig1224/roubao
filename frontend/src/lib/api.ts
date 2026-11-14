import { Article, Category, PageResult, Project, Result } from "@/types";
import { MOCK_ARTICLES, MOCK_PROJECTS } from "@/data/mockData";
import { cacheTag } from "next/cache";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8080";

interface BackendArticleVO {
  id?: number | string;
  title?: string;
  slug?: string;
  summary?: string;
  coverImageKey?: string;
  contentUrl?: string;
  fileType?: string;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  tags?: string[];
  readTimeMinutes?: number;
  sortOrder?: number;
  top?: boolean;
  featured?: boolean;
  publishedAt?: string;
  viewCount?: number;
  views?: number;
  likeCount?: number;
  contentMarkdown?: string;
}

interface BackendProjectVO {
  id?: number | string;
  projectName?: string;
  name?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  architectureHighlights?: string[];
  techTags?: string[];
  repoUrl?: string;
  demoUrl?: string;
  starCount?: number;
  stars?: number;
  metricsSummary?: string;
  metrics?: string;
  sortOrder?: number;
  featured?: boolean;
}

function categoryNameToSlug(name?: string): string {
  if (!name) return "backend";
  if (name.includes("前") || name.toLowerCase().includes("front")) return "frontend";
  if (name.includes("性能") || name.toLowerCase().includes("perf")) return "performance";
  if (name.includes("系统") || name.toLowerCase().includes("arch")) return "architecture";
  return "backend";
}

export function mapArticleFromVO(raw: BackendArticleVO): Article {
  const categorySlug = raw.categorySlug || categoryNameToSlug(raw.categoryName);
  return {
    id: String(raw.id || ""),
    title: raw.title || "",
    slug: raw.slug || "",
    summary: raw.summary || "",
    contentUrl: raw.contentUrl || "",
    fileType: raw.fileType || "md",
    category: categorySlug,
    categoryId: raw.categoryId,
    categoryName: raw.categoryName,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    views: raw.viewCount ?? raw.views ?? 0,
    likeCount: raw.likeCount ?? 0,
    readTimeMinutes: raw.readTimeMinutes ?? 5,
    publishedAt: raw.publishedAt || new Date().toISOString().slice(0, 10),
    contentMarkdown: raw.contentMarkdown || "",
    top: Boolean(raw.top),
    featured: Boolean(raw.featured),
  };
}

export function mapProjectFromVO(raw: BackendProjectVO): Project {
  return {
    id: String(raw.id || ""),
    name: raw.projectName || raw.name || "",
    projectName: raw.projectName,
    slug: raw.slug || "",
    tagline: raw.tagline || "",
    description: raw.description || "",
    architectureHighlights: Array.isArray(raw.architectureHighlights) ? raw.architectureHighlights : [],
    techTags: Array.isArray(raw.techTags) ? raw.techTags : [],
    repoUrl: raw.repoUrl || "",
    demoUrl: raw.demoUrl || "",
    stars: raw.starCount ?? raw.stars ?? 0,
    starCount: raw.starCount,
    featured: Boolean(raw.featured),
    metrics: raw.metricsSummary || raw.metrics || "",
    metricsSummary: raw.metricsSummary,
    sortOrder: raw.sortOrder ?? 0,
  };
}

export async function fetchArticles(params?: {
  categoryId?: number;
  tag?: string;
  keyword?: string;
  pageNo?: number;
  pageSize?: number;
}): Promise<Article[]> {
  "use cache";
  cacheTag("articles");
  try {
    const url = new URL(`${BACKEND_URL}/api/v1/articles`);
    if (params?.categoryId) url.searchParams.set("categoryId", String(params.categoryId));
    if (params?.tag) url.searchParams.set("tag", params.tag);
    if (params?.keyword) url.searchParams.set("keyword", params.keyword);
    if (params?.pageNo) url.searchParams.set("pageNo", String(params.pageNo));
    url.searchParams.set("pageSize", String(params?.pageSize || 20));

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return MOCK_ARTICLES;
    }

    const json = (await res.json()) as Result<PageResult<BackendArticleVO>>;
    if (json.code === 0 && json.data && Array.isArray(json.data.list)) {
      return json.data.list.map(mapArticleFromVO);
    }
    return MOCK_ARTICLES;
  } catch {
    return MOCK_ARTICLES;
  }
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  "use cache";
  cacheTag("articles");
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/articles/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const json = (await res.json()) as Result<BackendArticleVO>;
      if (json.code === 0 && json.data) {
        return mapArticleFromVO(json.data);
      }
    }
  } catch {
    // fallback to mock
  }

  const mock = MOCK_ARTICLES.find((a) => a.slug === slug);
  return mock || null;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/categories`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const json = (await res.json()) as Result<Category[]>;
      if (json.code === 0 && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // fallback
  }

  return [
    { id: 1, categoryName: "后端架构", categorySlug: "backend", description: "", iconName: "Server", sortOrder: 100 },
    { id: 2, categoryName: "前端工程", categorySlug: "frontend", description: "", iconName: "Layout", sortOrder: 90 },
    { id: 3, categoryName: "性能调优", categorySlug: "performance", description: "", iconName: "Cpu", sortOrder: 80 },
    { id: 4, categoryName: "系统架构", categorySlug: "architecture", description: "", iconName: "Boxes", sortOrder: 70 },
  ];
}

export async function fetchProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/projects/featured`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const json = (await res.json()) as Result<BackendProjectVO[]>;
      if (json.code === 0 && Array.isArray(json.data)) {
        return json.data.map(mapProjectFromVO);
      }
    }
  } catch {
    // fallback
  }

  return MOCK_PROJECTS;
}

export async function incrementArticleViews(slug: string): Promise<void> {
  try {
    await fetch(`/api/v1/articles/${encodeURIComponent(slug)}/views`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });
  } catch {
    // ignore
  }
}

export async function uploadMarkdownArticle(file: File, token: string): Promise<Result<number>> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/v1/admin/articles/upload", {
    method: "POST",
    headers: {
      "X-Admin-Token": token,
    },
    body: formData,
  });

  return (await res.json()) as Result<number>;
}

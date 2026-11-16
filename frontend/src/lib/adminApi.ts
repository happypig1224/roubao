import {
  Article,
  ArticleCreatePayload,
  ArticleUpdatePayload,
  CategoryPayload,
  CategoryStats,
  DashboardStats,
  PageResult,
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  Result,
} from "@/types";

/**
 * 后台管理 API 统一网络客户端
 * 统一承载 X-Admin-Token 安全请求头，并对后台响应结构执行契约归一化
 *
 * @author roubao
 * @since 2026-11-16
 */

const BASE_URL = "/api/v1/admin";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function adminRequest<T>(token: string, path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    "X-Admin-Token": token.trim(),
    Accept: "application/json",
  };

  const init: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body) {
    if (options.body instanceof FormData) {
      init.body = options.body;
    } else {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(url.toString(), init);
  const json = (await res.json()) as Result<T>;

  if (json.code !== 0) {
    throw new Error(json.message || `请求失败 (${json.code})`);
  }

  return json.data;
}

// 1. 鉴权与身份探活
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const data = await adminRequest<{ authenticated: boolean }>(token, "/auth/verify");
    return Boolean(data?.authenticated);
  } catch {
    return false;
  }
}

// 2. 仪表盘大盘数据
export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
  return adminRequest<DashboardStats>(token, "/dashboard/stats");
}

// 3. 文章管理
export async function fetchAdminArticles(
  token: string,
  params?: {
    pageNo?: number;
    pageSize?: number;
    keyword?: string;
    categoryId?: number;
    published?: boolean;
    tag?: string;
  }
): Promise<PageResult<Article>> {
  return adminRequest<PageResult<Article>>(token, "/articles", {
    params: {
      pageNo: params?.pageNo ?? 1,
      pageSize: params?.pageSize ?? 10,
      keyword: params?.keyword,
      categoryId: params?.categoryId,
      published: params?.published,
      tag: params?.tag,
    },
  });
}

export async function fetchAdminArticleDetail(token: string, id: number | string): Promise<Article> {
  return adminRequest<Article>(token, `/articles/${id}`);
}

export async function createAdminArticle(token: string, payload: ArticleCreatePayload): Promise<number> {
  return adminRequest<number>(token, "/articles", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminArticle(token: string, id: number | string, payload: ArticleUpdatePayload): Promise<void> {
  return adminRequest<void>(token, `/articles/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminArticle(token: string, id: number | string): Promise<void> {
  return adminRequest<void>(token, `/articles/${id}`, {
    method: "DELETE",
  });
}

export async function toggleArticleTop(token: string, id: number | string): Promise<void> {
  return adminRequest<void>(token, `/articles/${id}/top`, {
    method: "PATCH",
  });
}

export async function toggleArticleFeatured(token: string, id: number | string): Promise<void> {
  return adminRequest<void>(token, `/articles/${id}/featured`, {
    method: "PATCH",
  });
}

export async function updateArticlePublishStatus(token: string, id: number | string, published: boolean): Promise<void> {
  return adminRequest<void>(token, `/articles/${id}/publish`, {
    method: "PATCH",
    params: { published },
  });
}

export async function uploadMarkdownArticleDirect(token: string, file: File): Promise<number> {
  const formData = new FormData();
  formData.append("file", file);
  return adminRequest<number>(token, "/articles/upload", {
    method: "POST",
    body: formData,
  });
}

// 4. 分类管理
export async function fetchAdminCategories(token: string): Promise<CategoryStats[]> {
  return adminRequest<CategoryStats[]>(token, "/categories");
}

export async function createAdminCategory(token: string, payload: CategoryPayload): Promise<number> {
  return adminRequest<number>(token, "/categories", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminCategory(token: string, id: number | string, payload: CategoryPayload): Promise<void> {
  return adminRequest<void>(token, `/categories/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminCategory(token: string, id: number | string): Promise<void> {
  return adminRequest<void>(token, `/categories/${id}`, {
    method: "DELETE",
  });
}

// 5. 开源项目管理
export async function fetchAdminProjects(
  token: string,
  params?: {
    pageNo?: number;
    pageSize?: number;
    keyword?: string;
    featuredOnly?: boolean;
  }
): Promise<PageResult<Project>> {
  return adminRequest<PageResult<Project>>(token, "/projects", {
    params: {
      pageNo: params?.pageNo ?? 1,
      pageSize: params?.pageSize ?? 10,
      keyword: params?.keyword,
      featuredOnly: params?.featuredOnly,
    },
  });
}

export async function fetchAdminProjectDetail(token: string, id: number | string): Promise<Project> {
  return adminRequest<Project>(token, `/projects/${id}`);
}

export async function createAdminProject(token: string, payload: ProjectCreatePayload): Promise<number> {
  return adminRequest<number>(token, "/projects", {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminProject(token: string, id: number | string, payload: ProjectUpdatePayload): Promise<void> {
  return adminRequest<void>(token, `/projects/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteAdminProject(token: string, id: number | string): Promise<void> {
  return adminRequest<void>(token, `/projects/${id}`, {
    method: "DELETE",
  });
}

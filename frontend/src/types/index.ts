export interface Result<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  traceId?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNo: number;
  pageSize: number;
  totalPages: number;
}

export interface Category {
  id: number;
  categoryName: string;
  categorySlug: string;
  description: string;
  iconName: string;
  sortOrder: number;
}

export interface Project {
  id: string | number;
  name: string;
  projectName?: string;
  slug: string;
  tagline: string;
  description: string;
  architectureHighlights: string[];
  techTags: string[];
  repoUrl: string;
  demoUrl?: string;
  stars?: number;
  starCount?: number;
  featured: boolean;
  metrics?: string;
  metricsSummary?: string;
  sortOrder?: number;
}

export interface Article {
  id: string | number;
  title: string;
  slug: string;
  summary: string;
  contentUrl?: string;
  fileType?: "md" | "pdf" | (string & {});
  category: "backend" | "frontend" | "performance" | "architecture" | (string & {});
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  tags: string[];
  views: number;
  likeCount?: number;
  readTimeMinutes: number;
  publishedAt: string;
  contentMarkdown?: string;
  top?: boolean;
  featured?: boolean;
  published?: boolean;
}

export interface CategoryStats extends Category {
  articleCount: number;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalProjects: number;
  totalViews: number;
  totalLikes: number;
  categoryStats: CategoryStats[];
}

export interface ArticleCreatePayload {
  categoryId: number;
  title: string;
  slug: string;
  summary: string;
  coverImageKey?: string;
  tags: string[];
  readTimeMinutes?: number;
  sortOrder?: number;
  published?: boolean;
  top?: boolean;
  featured?: boolean;
  contentMarkdown: string;
}

export interface ArticleUpdatePayload {
  categoryId: number;
  title: string;
  slug: string;
  summary: string;
  coverImageKey?: string;
  tags: string[];
  readTimeMinutes?: number;
  sortOrder?: number;
  published?: boolean;
  top?: boolean;
  featured?: boolean;
  contentMarkdown: string;
}

export interface CategoryPayload {
  categoryName: string;
  categorySlug: string;
  description?: string;
  iconName?: string;
  sortOrder?: number;
}

export interface ProjectCreatePayload {
  projectName: string;
  slug: string;
  tagline: string;
  description: string;
  architectureHighlights: string[];
  techTags: string[];
  repoUrl: string;
  demoUrl?: string;
  starCount?: number;
  metricsSummary?: string;
  sortOrder?: number;
  featured?: boolean;
}

export interface ProjectUpdatePayload {
  projectName: string;
  slug: string;
  tagline: string;
  description: string;
  architectureHighlights: string[];
  techTags: string[];
  repoUrl: string;
  demoUrl?: string;
  starCount?: number;
  metricsSummary?: string;
  sortOrder?: number;
  featured?: boolean;
}

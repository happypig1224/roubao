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
  fileType?: "md" | "pdf" | string;
  category: "backend" | "frontend" | "performance" | "architecture" | string;
  categoryId?: number;
  categoryName?: string;
  tags: string[];
  views: number;
  likeCount?: number;
  readTimeMinutes: number;
  publishedAt: string;
  contentMarkdown?: string;
  top?: boolean;
  featured?: boolean;
}

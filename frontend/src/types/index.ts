export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  architectureHighlights: string[];
  techTags: string[];
  repoUrl: string;
  demoUrl?: string;
  stars?: number;
  featured: boolean;
  metrics?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentUrl: string; // Cloud storage CDN URL
  fileType: "md" | "pdf";
  category: "backend" | "frontend" | "performance" | "architecture";
  tags: string[];
  views: number;
  readTimeMinutes: number;
  publishedAt: string;
  contentMarkdown: string; // Sample markdown content for immediate reading demo
}

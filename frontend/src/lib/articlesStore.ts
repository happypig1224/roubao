import { timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { cacheTag } from "next/cache";
import { MOCK_ARTICLES } from "@/data/mockData";
import { Article } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

export const VALID_CATEGORIES = [
  "backend",
  "frontend",
  "performance",
  "architecture",
] as const;

export type ArticleCategory = (typeof VALID_CATEGORIES)[number];

export interface CreateArticleInput {
  title: string;
  slug: string;
  summary: string;
  contentUrl: string;
  category: ArticleCategory;
  tags: string[];
  contentMarkdown: string;
}

export class ArticleStoreError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ArticleStoreError";
    this.statusCode = statusCode;
  }
}

// Serialize file writes in-process to prevent concurrent write corruption
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(task, task);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function ensureArticlesFile(): Promise<Article[]> {
  try {
    const raw = await fs.readFile(ARTICLES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Article[];
    }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw err;
    }
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await writeArticlesAtomically(MOCK_ARTICLES);
  return MOCK_ARTICLES;
}

async function writeArticlesAtomically(articles: Article[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${ARTICLES_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(articles, null, 2), "utf-8");
  await fs.rename(tempFile, ARTICLES_FILE);
}

export async function readArticlesFromDisk(): Promise<Article[]> {
  return ensureArticlesFile();
}

export async function getCachedArticles(): Promise<Article[]> {
  "use cache";
  cacheTag("articles");
  return readArticlesFromDisk();
}

export async function getCachedArticleBySlug(
  slug: string
): Promise<Article | null> {
  "use cache";
  cacheTag("articles");
  const articles = await readArticlesFromDisk();
  return articles.find((item) => item.slug === slug) ?? null;
}

export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createArticleRecord(
  input: CreateArticleInput
): Promise<Article> {
  const title = input.title.trim();
  const slug = normalizeSlug(input.slug);
  const summary = input.summary.trim();
  const contentUrl = input.contentUrl.trim();
  const contentMarkdown = input.contentMarkdown.trim();

  if (!title || !slug || !summary || !contentUrl || !contentMarkdown) {
    throw new ArticleStoreError(
      "请完整填写标题、Slug、CDN 地址、摘要与正文",
      400
    );
  }

  if (!VALID_CATEGORIES.includes(input.category)) {
    throw new ArticleStoreError("非法的文章分类", 400);
  }

  return enqueueWrite(async () => {
    const articles = await ensureArticlesFile();
    if (articles.some((a) => a.slug === slug)) {
      throw new ArticleStoreError(`Slug "${slug}" 已存在，请更换别名`, 409);
    }

    const newArticle: Article = {
      id: `art-${Date.now()}`,
      title,
      slug,
      summary,
      contentUrl,
      fileType: "md",
      category: input.category,
      tags: input.tags.map((t) => t.trim()).filter(Boolean),
      views: 1,
      readTimeMinutes: Math.max(3, Math.ceil(contentMarkdown.length / 300)),
      publishedAt: new Date().toISOString().split("T")[0],
      contentMarkdown,
    };

    const updated = [newArticle, ...articles];
    await writeArticlesAtomically(updated);
    return newArticle;
  });
}

export async function incrementArticleViews(
  slug: string
): Promise<number | null> {
  return enqueueWrite(async () => {
    const articles = await ensureArticlesFile();
    const index = articles.findIndex((a) => a.slug === slug);
    if (index === -1) return null;

    const nextViews = articles[index].views + 1;
    const updated = articles.map((item, idx) =>
      idx === index ? { ...item, views: nextViews } : item
    );
    await writeArticlesAtomically(updated);
    return nextViews;
  });
}

export function verifyAdminToken(
  providedToken: string
): { ok: true } | { ok: false; reason: "unconfigured" | "invalid" } {
  const configured = process.env.ADMIN_TOKEN?.trim();
  const expected =
    configured ||
    (process.env.NODE_ENV === "production" ? "" : "roubao-secret-2026");

  if (!expected) {
    return { ok: false, reason: "unconfigured" };
  }

  const providedBuf = Buffer.from(providedToken.trim(), "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");
  if (
    providedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return { ok: false, reason: "invalid" };
  }

  return { ok: true };
}


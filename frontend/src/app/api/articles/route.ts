import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  ArticleCategory,
  ArticleStoreError,
  createArticleRecord,
  readArticlesFromDisk,
  verifyAdminToken,
} from "@/lib/articlesStore";

export async function GET() {
  try {
    const articles = await readArticlesFromDisk();
    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json(
      { error: "读取文章列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const providedToken = request.headers.get("x-admin-token") ?? "";
    const auth = verifyAdminToken(providedToken);
    if (!auth.ok) {
      if (auth.reason === "unconfigured") {
        return NextResponse.json(
          { error: "服务端尚未配置 ADMIN_TOKEN 环境变量" },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "Admin Token 校验失败" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Partial<{
      title: string;
      slug: string;
      summary: string;
      contentUrl: string;
      category: ArticleCategory;
      tags: string[];
      contentMarkdown: string;
    }>;

    const article = await createArticleRecord({
      title: body.title ?? "",
      slug: body.slug ?? "",
      summary: body.summary ?? "",
      contentUrl: body.contentUrl ?? "",
      category: (body.category ?? "backend") as ArticleCategory,
      tags: Array.isArray(body.tags) ? body.tags : [],
      contentMarkdown: body.contentMarkdown ?? "",
    });

    revalidateTag("articles", { expire: 0 });
    revalidatePath("/");
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath("/rss.xml");
    revalidatePath("/sitemap.xml");
    revalidatePath("/llms.txt");

    return NextResponse.json({ article }, { status: 201 });
  } catch (err) {
    if (err instanceof ArticleStoreError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.statusCode }
      );
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "请求体 JSON 格式错误" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "保存文章失败" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { incrementArticleViews } from "@/lib/articlesStore";

export async function POST(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const decodedSlug = decodeURIComponent(slug);
    const views = await incrementArticleViews(decodedSlug);

    if (views === null) {
      return NextResponse.json(
        { error: "未找到对应文章" },
        { status: 404 }
      );
    }

    // 注意：阅读量是独立高频统计指标，严禁在此调用 revalidateTag("articles") 或 revalidatePath("/")，
    // 从而防止每次阅读都摧毁全站静态构建与 ISR 缓存
    return NextResponse.json({ slug: decodedSlug, views });
  } catch {
    return NextResponse.json(
      { error: "更新阅读量失败" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Next.js 按需即时重验证安全路由 (On-Demand ISR Revalidation)
 * 支持通过 X-Admin-Token 请求头或 ?secret= 参数鉴权
 * 解决后台编辑发布文章后需等待 60 秒缓存自然过期的痛点
 *
 * @author roubao
 * @since 2026-11-21
 */
export async function POST(request: NextRequest) {
  const tokenHeader = request.headers.get("x-admin-token") || request.headers.get("X-Admin-Token");
  const secretParam = request.nextUrl.searchParams.get("secret");
  const configuredSecret = process.env.ADMIN_TOKEN || "roubao-admin-secret-token";

  const token = (tokenHeader || secretParam || "").trim();
  if (!token || token !== configuredSecret.trim()) {
    return NextResponse.json(
      { code: 401, message: "未授权的重验证请求：Token 无效或缺失" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const tag = body?.tag || request.nextUrl.searchParams.get("tag");
    const path = body?.path || request.nextUrl.searchParams.get("path");

    if (tag) {
      revalidateTag(tag, { expire: 0 });
    }
    if (path) {
      revalidatePath(path);
    }
    if (!tag && !path) {
      revalidateTag("articles", { expire: 0 });
      revalidatePath("/");
    }

    return NextResponse.json({
      code: 0,
      message: "按需即时重验证成功",
      data: {
        tag: tag || "articles",
        path: path || "/",
        timestamp: Date.now(),
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "未知异常";
    return NextResponse.json(
      { code: 500, message: `重验证失败: ${errorMsg}` },
      { status: 500 }
    );
  }
}

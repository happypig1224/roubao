import { test, expect } from "@playwright/test";

test.describe("Next.js 按需即时重验证 API 契约与鉴权门禁 (/api/revalidate)", () => {
  test("未提供 X-Admin-Token 或 secret 时应返回 401 Unauthorized", async ({ request }) => {
    const response = await request.post("/api/revalidate", {
      data: { tag: "articles" },
    });
    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.code).toBe(401);
    expect(json.message).toContain("未授权");
  });

  test("提供错误 Token 时应返回 401 拦截并阻断缓存清除", async ({ request }) => {
    const response = await request.post("/api/revalidate", {
      headers: {
        "X-Admin-Token": "invalid-token-12345",
      },
      data: { tag: "articles" },
    });
    expect(response.status()).toBe(401);
  });

  test("提供合法 Token 时应成功触发按需重验证并返回 200 OK 与正确元数据", async ({ request }) => {
    const token = process.env.ADMIN_TOKEN || "roubao-admin-secret-token";
    const response = await request.post("/api/revalidate", {
      headers: {
        "X-Admin-Token": token,
      },
      data: { tag: "articles", path: "/" },
    });
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.code).toBe(0);
    expect(json.message).toContain("按需即时重验证成功");
    expect(json.data.tag).toBe("articles");
    expect(json.data.path).toBe("/");
    expect(json.data.timestamp).toBeGreaterThan(0);
  });
});

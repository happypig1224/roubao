import { test, expect } from "@playwright/test";

test.describe("独立后台管理系统 (/admin) 交互与鉴权门禁验证", () => {
  test.beforeEach(async ({ page }) => {
    // 确保清理任何旧会话
    await page.goto("/admin");
  });

  test("未提供 Token 直接访问 /admin 应展示管理员安全解锁弹窗且不泄露前台导航", async ({ page }) => {
    // 验证安全解锁弹窗可见
    const authTitle = page.locator("#auth-modal-title");
    await expect(authTitle).toBeVisible({ timeout: 10000 });
    await expect(authTitle).toHaveText("管理员凭证解锁");

    // 验证前台导航栏不存在（绝对隔离）
    await expect(page.locator("nav a[href='/#projects']")).not.toBeVisible();
    await expect(page.locator("nav a[href='/#articles']")).not.toBeVisible();

    // 验证存在密码输入框与解锁按钮
    const tokenInput = page.locator("input[type='password']");
    await expect(tokenInput).toBeVisible();
    const unlockBtn = page.locator("button[type='submit']");
    await expect(unlockBtn).toBeVisible();
  });

  test("输入错误 Token 时触发服务端校验拦截并显示错误反馈", async ({ page }) => {
    // Mock 探活接口返回 401
    await page.route("**/api/v1/admin/auth/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 401,
          message: "未通过身份认证，禁止访问",
          data: null,
          timestamp: Date.now(),
        }),
      });
    });

    const tokenInput = page.locator("input[type='password']");
    await tokenInput.fill("wrong-password-token");
    const unlockBtn = page.locator("button[type='submit']");
    await unlockBtn.click();

    // 验证出现错误反馈提示
    const errorNotice = page.locator("text=安全凭证无效或未通过服务端鉴权校验");
    await expect(errorNotice).toBeVisible({ timeout: 5000 });
  });

  test("输入正确 Token 成功解锁并进入大盘，支持多 Tab 切换与退出", async ({ page }) => {
    // Mock 探活接口返回成功
    await page.route("**/api/v1/admin/auth/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          message: "success",
          data: { authenticated: true, role: "ADMIN" },
          timestamp: Date.now(),
        }),
      });
    });

    // Mock 仪表盘大盘数据
    await page.route("**/api/v1/admin/dashboard/stats", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          message: "success",
          data: {
            totalArticles: 12,
            publishedArticles: 10,
            draftArticles: 2,
            totalProjects: 4,
            totalViews: 38500,
            totalLikes: 1260,
            categoryStats: [
              { id: 1, categoryName: "后端架构", categorySlug: "backend", articleCount: 6 },
              { id: 2, categoryName: "前端工程", categorySlug: "frontend", articleCount: 4 },
            ],
          },
          timestamp: Date.now(),
        }),
      });
    });

    // Mock 文章列表数据
    await page.route("**/api/v1/admin/articles*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          message: "success",
          data: {
            list: [
              {
                id: 1,
                title: "Java 21 虚拟线程压测与踩坑记录",
                slug: "java-21-virtual-threads-benchmark-pitfalls",
                categoryName: "后端架构",
                categorySlug: "backend",
                published: true,
                top: true,
                featured: true,
                views: 12500,
                publishedAt: "2026-11-14",
              },
            ],
            total: 1,
            pageNo: 1,
            pageSize: 10,
            totalPages: 1,
          },
          timestamp: Date.now(),
        }),
      });
    });

    // Mock 分类数据
    await page.route("**/api/v1/admin/categories*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          message: "success",
          data: [
            { id: 1, categoryName: "后端架构", categorySlug: "backend", description: "Java 与微服务", sortOrder: 100, articleCount: 6 },
            { id: 2, categoryName: "前端工程", categorySlug: "frontend", description: "React 与 Next.js", sortOrder: 90, articleCount: 4 },
          ],
          timestamp: Date.now(),
        }),
      });
    });

    // Mock 项目数据
    await page.route("**/api/v1/admin/projects*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          message: "success",
          data: {
            list: [
              {
                id: 1,
                projectName: "Roubao Gateway",
                slug: "roubao-gateway",
                tagline: "高性能网关",
                stars: 128,
                featured: true,
              },
            ],
            total: 1,
            pageNo: 1,
            pageSize: 10,
            totalPages: 1,
          },
          timestamp: Date.now(),
        }),
      });
    });

    // 输入有效 Token
    const tokenInput = page.locator("input[type='password']");
    await tokenInput.fill("roubao-admin-secret-token");
    const unlockBtn = page.locator("button[type='submit']");
    await unlockBtn.click();

    // 1. 验证大盘页面成功载入
    await expect(page.locator("h1:has-text('系统大盘总览')")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=已鉴权")).toBeVisible();
    await expect(page.locator("text=全站总浏览")).toBeVisible();

    // 2. 切换至文章管理 Tab
    await page.locator("button:has-text('文章管理')").first().click();
    await expect(page.locator("h1:has-text('文章内容库管理')")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Java 21 虚拟线程压测与踩坑记录")).toBeVisible();

    // 3. 切换至分类管理 Tab
    await page.locator("button:has-text('分类体系')").first().click();
    await expect(page.locator("h1:has-text('分类体系管理')")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("h3:has-text('后端架构')")).toBeVisible();

    // 4. 切换至开源展厅 Tab
    await page.locator("button:has-text('开源展厅')").first().click();
    await expect(page.locator("h1:has-text('开源展厅项目管理')")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Roubao Gateway")).toBeVisible();

    // 5. 点击退出按钮
    await page.locator("button:has-text('退出')").click();

    // 验证退回至安全解锁界面
    await expect(page.locator("#auth-modal-title")).toBeVisible({ timeout: 5000 });
  });
});

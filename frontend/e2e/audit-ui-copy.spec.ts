import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("Playwright 驱动全量 UI 页面文案提取与视觉审核", () => {
  const extractedSections: { pageName: string; sectionName: string; texts: string[] }[] = [];

  function record(pageName: string, sectionName: string, text: string) {
    const cleaned = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (cleaned.length > 0) {
      extractedSections.push({ pageName, sectionName, texts: cleaned });
    }
  }

  test("1. 审核并抓取首页 (Hero, Projects, Blog, Footer, Navbar, ResumeSheet)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 导航栏
    const navText = await page.locator("nav").innerText();
    record("首页 (/) ", "顶部导航栏 (Navbar)", navText);

    // Hero 区域
    const heroText = await page.locator("#top").innerText();
    record("首页 (/) ", "首屏简介区 (Hero)", heroText);

    // Projects 区域
    const projectsText = await page.locator("#projects").innerText();
    record("首页 (/) ", "开源项目展厅 (ProjectsSection)", projectsText);

    // Blog 区域
    const blogText = await page.locator("#blog").innerText();
    record("首页 (/) ", "技术文章专区 (BlogSection)", blogText);

    // Footer 区域
    const footerText = await page.locator("footer").innerText();
    record("首页 (/) ", "页脚版权与联系方式 (Footer)", footerText);

    // 打开简历抽屉
    const resumeBtn = page.locator("button:has-text('工程履历 / 简历')");
    if (await resumeBtn.isVisible()) {
      await resumeBtn.click();
      await page.waitForTimeout(600);
      const sheet = page.locator("[role='dialog']").first();
      if (await sheet.isVisible()) {
        const sheetText = await sheet.innerText();
        record("首页 (/) ", "简历抽屉弹窗 (ResumeSheet)", sheetText);
        // 按 ESC 关闭
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
    }
  });

  test("2. 审核并抓取文章详情页 (/blog/[slug])", async ({ page }) => {
    // 拦截文章详情和列表 API
    await page.route("**/api/v1/articles/welcome-to-roubao", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          message: "success",
          data: {
            id: 1,
            title: "Roubao 系统设计：基于 Java 21 虚拟线程与 Next.js 16 的全栈实践",
            slug: "welcome-to-roubao",
            summary: "深入剖析高并发低延迟架构，从 Spring Boot 3 虚拟线程调度到底座缓存设计。",
            content: "### 架构演进之路\n在传统阻塞模型中，线程往往是昂贵的资源。不是硬件不够快，而是线程阻塞拖垮了并发。\n\n一句话总结：虚拟线程彻底改变了并发编程模型。\n\n对于后端开发来说，采用 Java 21 虚拟线程可以极大提升 I/O 密集型任务的吞吐量。",
            categoryId: 1,
            category: "后端架构",
            categoryName: "后端架构",
            views: 1024,
            likes: 68,
            tags: ["Java21", "虚拟线程", "Next.js"],
            coverUrl: "",
            published: true,
            createdAt: "2026-11-14T10:00:00Z",
            updatedAt: "2026-11-14T10:00:00Z",
          },
        }),
      });
    });

    await page.route("**/api/v1/articles", async (route) => {
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
                title: "Roubao 系统设计：基于 Java 21 虚拟线程与 Next.js 16 的全栈实践",
                slug: "welcome-to-roubao",
                summary: "深入剖析高并发低延迟架构，从 Spring Boot 3 虚拟线程调度到底座缓存设计。",
                category: "后端架构",
                categoryName: "后端架构",
                views: 1024,
                likes: 68,
                tags: ["Java21", "虚拟线程", "Next.js"],
                published: true,
                createdAt: "2026-11-14T10:00:00Z",
              },
            ],
            total: 1,
            pageNo: 1,
            pageSize: 10,
            totalPages: 1,
          },
        }),
      });
    });

    await page.goto("/blog/welcome-to-roubao");
    await page.waitForLoadState("networkidle");

    const articleMain = page.locator("main");
    if (await articleMain.isVisible()) {
      const mainText = await articleMain.innerText();
      record("文章详情页 (/blog/[slug])", "文章正文与交互元素", mainText);
    }
  });

  test("3. 审核并抓取 404 页面 (/not-found)", async ({ page }) => {
    await page.goto("/page-not-found-for-copy-audit-test");
    await page.waitForLoadState("networkidle");

    const notFoundCard = page.locator(".apple-card").first();
    if (await notFoundCard.isVisible()) {
      const cardText = await notFoundCard.innerText();
      record("404 异常提示页", "404 缺省引导卡片", cardText);
    }
  });

  test("4. 审核并抓取后台管理工作台 (/admin)", async ({ page }) => {
    // 1. 未登录状态模态框
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const authModal = page.locator("#auth-modal-title").locator("xpath=ancestor::div[contains(@class, 'apple-card')]");
    if (await authModal.isVisible()) {
      const modalText = await authModal.innerText();
      record("后台管理系统 (/admin)", "登录/安全凭证解锁弹窗", modalText);
    }

    // 2. Mock 鉴权成功与数据
    await page.route("**/api/v1/admin/auth/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          message: "success",
          data: { authenticated: true, role: "ADMIN" },
        }),
      });
    });

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
        }),
      });
    });

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
                title: "Java 21 虚拟线程与高并发实践",
                slug: "java-21-virtual-threads",
                summary: "测试文章摘要",
                categoryId: 1,
                categoryName: "后端架构",
                categorySlug: "backend",
                published: true,
                views: 520,
                likes: 35,
                tags: ["Java", "并发"],
                createdAt: "2026-11-14T10:00:00Z",
              },
            ],
            total: 1,
            pageNo: 1,
            pageSize: 10,
            totalPages: 1,
          },
        }),
      });
    });

    await page.route("**/api/v1/admin/categories*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          message: "success",
          data: [
            { id: 1, name: "后端架构", slug: "backend", description: "服务端与高并发", sortOrder: 1, articleCount: 6 },
            { id: 2, name: "前端工程", slug: "frontend", description: "现代 Web 体验", sortOrder: 2, articleCount: 4 },
          ],
        }),
      });
    });

    await page.route("**/api/v1/admin/projects*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          code: 0,
          message: "success",
          data: [
            {
              id: 1,
              name: "Roubao 博客系统",
              tagline: "现代全栈博客与作品集",
              description: "基于 Java 21 与 Next.js 16 构建",
              techTags: ["Java 21", "Next.js"],
              sortOrder: 1,
              isFeatured: true,
              repoUrl: "https://github.com",
            },
          ],
        }),
      });
    });

    // 解锁
    const tokenInput = page.locator("input[type='password']");
    if (await tokenInput.isVisible()) {
      await tokenInput.fill("roubao-admin-secret-token");
      await page.locator("button[type='submit']").click();
      await page.waitForTimeout(600);
    }

    // 抓取 Dashboard
    const dashboard = page.locator("main");
    const dashText = await dashboard.innerText();
    record("后台管理系统 (/admin)", "大盘仪表盘 (DashboardView)", dashText);

    // 切换至文章管理
    const articlesTab = page.locator("button:has-text('文章管理')").first();
    if (await articlesTab.isVisible()) {
      await articlesTab.click();
      await page.waitForTimeout(400);
      const articlesText = await dashboard.innerText();
      record("后台管理系统 (/admin)", "文章管理工作台 (ArticlesView)", articlesText);
    }

    // 切换至分类管理
    const categoriesTab = page.locator("button:has-text('分类管理')").first();
    if (await categoriesTab.isVisible()) {
      await categoriesTab.click();
      await page.waitForTimeout(400);
      const catText = await dashboard.innerText();
      record("后台管理系统 (/admin)", "分类管理工作台 (CategoriesView)", catText);
    }

    // 切换至项目管理
    const projectsTab = page.locator("button:has-text('项目管理')").first();
    if (await projectsTab.isVisible()) {
      await projectsTab.click();
      await page.waitForTimeout(400);
      const projText = await dashboard.innerText();
      record("后台管理系统 (/admin)", "开源项目管理工作台 (ProjectsView)", projText);
    }
  });

  test.afterAll(async () => {
    // 汇总并保存至文件
    const auditDir = path.resolve(process.cwd(), "audit");
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    let mdContent = `# Roubao 全栈 UI 页面真实文案汇总 (由 Playwright 真实渲染提取)\n\n`;
    mdContent += `> 提取时间: ${new Date().toISOString()}\n`;
    mdContent += `> 提取页面数量: 4 大核心路由 (首页 /、文章详情 /blog/[slug]、404 引导页、后台管理 /admin)\n\n---\n\n`;

    let currentSection = "";
    for (const item of extractedSections) {
      if (item.pageName !== currentSection) {
        currentSection = item.pageName;
        mdContent += `\n## 📄 ${currentSection}\n\n`;
      }
      mdContent += `### 🔹 ${item.sectionName}\n\n`;
      for (const line of item.texts) {
        mdContent += `${line}\n\n`;
      }
    }

    const outPath = path.join(auditDir, "ui-pages-copy.md");
    fs.writeFileSync(outPath, mdContent, "utf-8");
    console.log(`[Playwright Audit] 成功导出全量 UI 文本至: ${outPath} (共 ${extractedSections.length} 个区域)`);
  });
});

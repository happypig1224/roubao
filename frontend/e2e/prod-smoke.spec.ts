import { test, expect } from "@playwright/test";

test.describe("公网生产环境 (https://roubao.cloud) 真实状态与无虚假数据自动化验证", () => {
  test.use({ baseURL: "https://roubao.cloud" });

  test("生产环境页面首屏加载成功并仅展示真实个人简介（Personal Bio）", async ({ page }) => {
    await page.goto("https://roubao.cloud/", { waitUntil: "domcontentloaded", timeout: 60000 });

    // 1. 验证标题与导航
    await expect(page).toHaveTitle(/肉包 \(Roubao\)/);
    await expect(page.locator("nav")).toBeVisible();

    // 2. 验证个人简介核心要素
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("肉包");

    await expect(page.locator("text=全栈软件工程师 · 专注于高性能后端架构与现代 Web 开发")).toBeVisible();
    await expect(page.locator("text=中国 · 杭州")).toBeVisible();
    await expect(page.locator("text=开放架构与全栈交流")).toBeVisible();

    // 3. 验证操作触点（简历、GitHub、Email）
    await expect(page.locator("text=查看与下载简历 (PDF)")).toBeVisible();
    await expect(page.locator("a:has-text('GitHub')").first()).toBeVisible();
    await expect(page.locator("a:has-text('Email')").first()).toBeVisible();

    // 4. 验证核心技术专长三支柱
    await expect(page.locator("text=核心技术专长 / Capabilities")).toBeVisible();
    await expect(page.locator("text=高并发服务架构")).toBeVisible();
    await expect(page.locator("text=可观测与存储设计")).toBeVisible();
    await expect(page.locator("text=现代 Web 工程")).toBeVisible();
  });

  test("生产环境绝无任何硬编码虚假项目与笔记数据残留", async ({ page }) => {
    await page.goto("https://roubao.cloud/");
    const content = await page.content();

    // 绝不能出现写死的假项目
    expect(content).not.toContain("Roubao Gateway");
    expect(content).not.toContain("38K req/sec");
    expect(content).not.toContain("38K QPS");
    expect(content).not.toContain("CloudTrace Hub");
    expect(content).not.toContain("Tactile UI");

    // 绝不能出现写死的假笔记/文章
    expect(content).not.toContain("Java 21 虚拟线程压测与踩坑记录");

    // Hero 区域无假技术笔记跳转
    await expect(page.locator("a:has-text('阅读《Java 21 虚拟线程压测与踩坑记录》')")).toHaveCount(0);
  });

  test("开源项目展厅与文章流在空数据下规范呈现空状态", async ({ page }) => {
    await page.goto("https://roubao.cloud/");

    // 项目空状态
    await expect(page.locator("text=暂无开源项目展示")).toBeVisible();

    // 文章空状态
    await expect(page.locator("text=未找到匹配文章")).toBeVisible();
  });
});

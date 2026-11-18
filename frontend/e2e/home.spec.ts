import { test, expect } from "@playwright/test";

test.describe("肉包技术博客与展厅首页 - 纯净个人简介与无虚假数据 E2E 验证", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("页面首屏加载成功并展示真实规范的个人简介（Personal Bio）", async ({ page }) => {
    // 1. 验证页面 SEO 标题
    await expect(page).toHaveTitle(/肉包 \(Roubao\)/);

    // 2. 验证导航栏
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // 3. 验证个人身份核心元素：姓名、定位与地理坐标
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("肉包");

    const roleText = page.locator("text=全栈软件工程师 · 专注于高性能后端架构与现代 Web 开发");
    await expect(roleText).toBeVisible();

    const locationBadge = page.locator("text=中国 · 杭州");
    await expect(locationBadge).toBeVisible();

    const statusBadge = page.locator("text=开放架构与全栈交流");
    await expect(statusBadge).toBeVisible();

    // 4. 验证操作触点（简历、GitHub、Email）正常可见
    const resumeBtn = page.locator("text=查看与下载简历 (PDF)");
    await expect(resumeBtn).toBeVisible();

    const githubLink = page.locator("a:has-text('GitHub')").first();
    await expect(githubLink).toBeVisible();

    const emailBtn = page.locator("a:has-text('Email')").first();
    await expect(emailBtn).toBeVisible();

    // 5. 验证核心技术专长三支柱
    await expect(page.locator("text=核心技术专长 / Capabilities")).toBeVisible();
    await expect(page.locator("text=高并发服务架构")).toBeVisible();
    await expect(page.locator("text=可观测与存储设计")).toBeVisible();
    await expect(page.locator("text=现代 Web 工程")).toBeVisible();
  });

  test("数据库清空后，全站绝不存在任何硬编码或虚假数据", async ({ page }) => {
    const pageContent = await page.content();

    // 1. 绝不能出现原硬编码项目 "Roubao Gateway"
    expect(pageContent).not.toContain("Roubao Gateway");

    // 2. 绝不能出现虚构压测指标 "38K"
    expect(pageContent).not.toContain("38K req/sec");
    expect(pageContent).not.toContain("38K QPS");

    // 3. 绝不能出现写死的技术文章标题 "Java 21 虚拟线程压测与踩坑记录"
    expect(pageContent).not.toContain("Java 21 虚拟线程压测与踩坑记录");

    // 4. 绝不能出现虚假项目 "CloudTrace Hub" 与 "Tactile UI"
    expect(pageContent).not.toContain("CloudTrace Hub");
    expect(pageContent).not.toContain("Tactile UI");

    // 5. Hero 区域不能出现指向不存在笔记的假链接
    const fakeBlogLink = page.locator("a:has-text('阅读《Java 21 虚拟线程压测与踩坑记录》')");
    await expect(fakeBlogLink).toHaveCount(0);
  });

  test("开源项目展厅与技术文章流正确呈现规范的空状态（Empty State）", async ({ page }) => {
    // 1. 滚动至开源项目展厅
    const projectsSection = page.locator("#projects");
    await expect(projectsSection).toBeVisible();

    // 验证空状态提示卡片
    const emptyProjectsText = page.locator("text=暂无开源项目展示");
    await expect(emptyProjectsText).toBeVisible();

    // 2. 滚动至博客流区域
    const blogSection = page.locator("#blog");
    await expect(blogSection).toBeVisible();

    // 验证分类 Tab 包含 "全部"
    const allTab = page.locator("button:has-text('全部')").first();
    await expect(allTab).toBeVisible();

    // 验证文章流呈现空状态
    const emptyBlogText = page.locator("text=未找到匹配文章");
    await expect(emptyBlogText).toBeVisible();
  });
});

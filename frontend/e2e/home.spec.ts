import { test, expect } from "@playwright/test";

test.describe("肉包技术博客与展厅首页 - 纯净真实性与无虚假数据 E2E 验证", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("页面首屏加载成功并仅展示真实规范的个人简介（Personal Bio）", async ({ page }) => {
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

    const emailBtn = page.locator("button:has-text('Email'), a:has-text('Email')").first();
    await expect(emailBtn).toBeVisible();

    // 5. 验证核心技术专长三支柱
    await expect(page.locator("text=核心技术专长 / Capabilities")).toBeVisible();
    await expect(page.locator("text=高并发服务架构")).toBeVisible();
    await expect(page.locator("text=可观测与存储设计")).toBeVisible();
    await expect(page.locator("text=现代 Web 工程")).toBeVisible();
  });

  test("数据库清空后，全站绝不存在任何硬编码虚假数据或伪造项目/文稿", async ({ page }) => {
    const pageContent = await page.content();

    // 1. 绝不能出现任何硬编码或虚构项目
    expect(pageContent).not.toContain("Roubao Gateway");
    expect(pageContent).not.toContain("38K req/sec");
    expect(pageContent).not.toContain("38K QPS");
    expect(pageContent).not.toContain("18,950 QPS");
    expect(pageContent).not.toContain("CloudTrace Hub");
    expect(pageContent).not.toContain("ROUBAO ENGINEERING HUD");
    expect(pageContent).not.toContain("ArchitectureManifesto");

    // 2. 绝不能出现写死的假技术文章标题
    expect(pageContent).not.toContain("Java 21 虚拟线程压测与踩坑记录");
    expect(pageContent).not.toContain("Java 21 虚拟线程生产避坑实录");
    expect(pageContent).not.toContain("为什么不建议用 MySQL 存 Markdown 长文");
    expect(pageContent).not.toContain("浅谈现代 Web 界面的细节质感");

    // 3. Hero 区域不能出现指向不存在笔记的假链接
    const fakeBlogLink = page.locator("a:has-text('阅读《Java 21 虚拟线程压测与踩坑记录》')");
    await expect(fakeBlogLink).toHaveCount(0);
  });

  test("开源项目展厅与技术文章流在空数据下呈现纯净极简的空状态（无虚假卡片堆叠）", async ({ page }) => {
    // 1. 滚动至开源项目展厅
    const projectsSection = page.locator("#projects");
    await expect(projectsSection).toBeVisible();

    // 验证绝无粗暴的 '0 项开源实践在线' 标签与虚假在研卡片
    await expect(page.locator("text=0 项开源实践在线")).toHaveCount(0);
    await expect(page.locator("text=在研工坊")).toHaveCount(0);
    await expect(page.locator("text=暂无已公开发布的开源项目")).toBeVisible();

    // 2. 滚动至博客流区域
    const blogSection = page.locator("#blog");
    await expect(blogSection).toBeVisible();

    // 验证绝无写死的文稿排期卡片
    await expect(page.locator("text=Upcoming Publications")).toHaveCount(0);
    await expect(page.locator("text=暂无已公开发布的技术文章")).toBeVisible();
  });
});

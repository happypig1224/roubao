import { test, expect } from "@playwright/test";

test.describe("肉包技术博客与展厅首页 - 纯净真实性与无虚假数据 E2E 验证", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("页面首屏加载成功并展示规范真实的个人简介（Personal Bio）", async ({ page }) => {
    // 1. 验证页面 SEO 标题
    await expect(page).toHaveTitle(/苦恼的肉包/);

    // 2. 验证导航栏
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // 3. 验证个人身份核心元素：昵称、学历专业、开放交流状态
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("苦恼的肉包");

    const eduBadge = page.locator("text=2027届全日制本科 · 计算机科学与技术");
    await expect(eduBadge).toBeVisible();

    const statusBadge = page.locator("text=开放实习交流 · 后端开发 & AI 工程化");
    await expect(statusBadge).toBeVisible();

    // 4. 验证操作触点（工程履历/简历、GitHub、Email）正常可见
    const resumeBtn = page.locator("button:has-text('工程履历 / 简历')");
    await expect(resumeBtn).toBeVisible();

    const githubLink = page.locator("a:has-text('GitHub')").first();
    await expect(githubLink).toBeVisible();

    const emailBtn = page.locator("button:has-text('Email'), a:has-text('Email')").first();
    await expect(emailBtn).toBeVisible();

    // 5. 验证个人陈述规范书写，且已彻底移除杂乱的专业技能体系大面板
    await expect(page.locator(".max-w-\\[68ch\\]")).toContainText("你好，我是肉包。");
    await expect(page.locator(".max-w-\\[68ch\\]")).toContainText("2027届全日制本科计算机科学与技术专业");
    await expect(page.locator(".max-w-\\[68ch\\]")).toContainText("专注 后端开发 与 大模型工程化落地。");
    await expect(page.locator("text=专业技能体系 · Technical Skills")).toHaveCount(0);
  });

  test("全站绝无隐私泄露（无真实姓名、无学校名称、无手机号码）", async ({ page }) => {
    const pageContent = await page.content();
    expect(pageContent).not.toContain("吴汇明");
    expect(pageContent).not.toContain("绥化学院");
    expect(pageContent).not.toContain("19997556314");
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

    await expect(page.locator("text=0 项开源实践在线")).toHaveCount(0);
    await expect(page.locator("text=在研工坊")).toHaveCount(0);
    await expect(page.locator("text=暂无已公开发布的开源项目")).toBeVisible();

    // 2. 滚动至博客流区域
    const blogSection = page.locator("#blog");
    await expect(blogSection).toBeVisible();

    await expect(page.locator("text=Upcoming Publications")).toHaveCount(0);
    await expect(page.locator("text=暂无已公开发布的技术文章")).toBeVisible();
  });
});

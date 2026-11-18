import { test, expect } from "@playwright/test";

test.describe("公网生产环境 (https://roubao.cloud) 真实状态与工匠级 UI 自动化验证", () => {
  test.use({ baseURL: "https://roubao.cloud" });
  test.setTimeout(90000);
  test.describe.configure({ retries: 2 });

  test("生产环境页面首屏加载成功并展示真实个人简介与 Engineering HUD", async ({ page }) => {
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
    await expect(page.locator("button:has-text('Email'), a:has-text('Email')").first()).toBeVisible();

    // 4. 验证核心技术专长三支柱
    await expect(page.locator("text=核心技术专长 / Capabilities")).toBeVisible();
    await expect(page.locator("text=高并发服务架构")).toBeVisible();
    await expect(page.locator("text=可观测与存储设计")).toBeVisible();
    await expect(page.locator("text=现代 Web 工程")).toBeVisible();

    // 5. 验证 Engineering HUD 控制台
    await expect(page.locator("text=ROUBAO ENGINEERING HUD")).toBeVisible();
    await expect(page.locator("text=CST (UTC+8)")).toBeVisible();
  });

  test("生产环境绝无任何硬编码伪造指标与写死假项目", async ({ page }) => {
    await page.goto("https://roubao.cloud/", { waitUntil: "domcontentloaded", timeout: 60000 });
    const content = await page.content();

    // 绝不能出现写死的假指标
    expect(content).not.toContain("38K req/sec");
    expect(content).not.toContain("38K QPS");
    expect(content).not.toContain("18,950 QPS");

    // 绝不能出现写死的假笔记/文章
    expect(content).not.toContain("Java 21 虚拟线程压测与踩坑记录");

    // Hero 区域无假技术笔记跳转
    await expect(page.locator("a:has-text('阅读《Java 21 虚拟线程压测与踩坑记录》')")).toHaveCount(0);
  });

  test("开源项目展厅与文章流在空数据下优雅呈现工坊在研蓝图与专栏排期", async ({ page }) => {
    await page.goto("https://roubao.cloud/", { waitUntil: "domcontentloaded", timeout: 60000 });

    // 验证绝无粗暴的 '0 项开源实践在线' 标签与死板大白框
    await expect(page.locator("text=0 项开源实践在线")).toHaveCount(0);
    await expect(page.locator("text=暂无开源项目展示")).toHaveCount(0);
    await expect(page.locator("text=未找到匹配文章")).toHaveCount(0);

    // 验证工坊蓝图与专栏排期
    await expect(page.locator("text=在研工坊 · 筹备发布中")).toBeVisible();
    await expect(page.locator("text=高性能 API 网关内核实践")).toBeVisible();
    await expect(page.locator("text=技术文章与长文专栏")).toBeVisible();
    await expect(page.locator("text=Upcoming Publications")).toBeVisible();
  });
});

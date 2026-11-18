import { test, expect } from "@playwright/test";

test.describe("肉包技术博客与展厅首页 - 工匠级 UI 重构与纯净真实性 E2E 验证", () => {
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

    const emailBtn = page.locator("button:has-text('Email'), a:has-text('Email')").first();
    await expect(emailBtn).toBeVisible();

    // 5. 验证核心技术专长三支柱
    await expect(page.locator("text=核心技术专长 / Capabilities")).toBeVisible();
    await expect(page.locator("text=高并发服务架构")).toBeVisible();
    await expect(page.locator("text=可观测与存储设计")).toBeVisible();
    await expect(page.locator("text=现代 Web 工程")).toBeVisible();
  });

  test("Hero 右侧 HUD 控制台完美运行且绝无虚假伪造指标", async ({ page }) => {
    // 1. 验证 HUD 控制台正常渲染，消灭大片死白
    const hud = page.locator("text=ROUBAO ENGINEERING HUD");
    await expect(hud).toBeVisible();

    // 2. 验证真实杭州时钟指示器存在 (CST UTC+8)
    await expect(page.locator("text=CST (UTC+8)")).toBeVisible();

    // 3. 验证选项卡交互（技术栈矩阵 / 架构宣言）
    const stackTab = page.locator("button:has-text('技术栈矩阵')");
    const archTab = page.locator("button:has-text('架构宣言')");
    await expect(stackTab).toBeVisible();
    await expect(archTab).toBeVisible();

    // 点击架构宣言选项卡
    await archTab.click();
    await expect(page.locator("text=ArchitectureManifesto")).toBeVisible();
    await expect(page.locator("text=坚持清晰的模块边界与分层防腐")).toBeVisible();

    // 4. 严苛断言：绝不能出现原硬编码伪造指标（如 38K QPS 或假数据压测图）
    const pageContent = await page.content();
    expect(pageContent).not.toContain("38K req/sec");
    expect(pageContent).not.toContain("38K QPS");
    expect(pageContent).not.toContain("18,950 QPS");
    expect(pageContent).not.toContain("Java 21 虚拟线程压测与踩坑记录");
  });

  test("开源项目展厅与技术文章流优雅呈现工坊在研蓝图与专栏排期（消灭绝望的 0 与死白方块）", async ({ page }) => {
    // 1. 滚动至开源项目展厅
    const projectsSection = page.locator("#projects");
    await expect(projectsSection).toBeVisible();

    // 验证绝无粗暴的 '0 项开源实践在线' 标签与死板大白框
    await expect(page.locator("text=0 项开源实践在线")).toHaveCount(0);
    await expect(page.locator("text=暂无开源项目展示")).toHaveCount(0);

    // 验证在研工坊标识与架构蓝图卡片呈现
    await expect(page.locator("text=在研工坊 · 筹备发布中")).toBeVisible();
    await expect(page.locator("text=高性能 API 网关内核实践")).toBeVisible();

    // 2. 滚动至博客流区域
    const blogSection = page.locator("#blog");
    await expect(blogSection).toBeVisible();

    // 验证绝无冷冰冰的 '全部 0' 计数药丸与 '未找到匹配文章' 报错式提示
    await expect(page.locator("text=未找到匹配文章")).toHaveCount(0);

    // 验证技术文章与长文专栏排期卡片正常渲染
    await expect(page.locator("text=技术文章与长文专栏")).toBeVisible();
    await expect(page.locator("text=Upcoming Publications")).toBeVisible();
    await expect(page.locator("text=Java 21 虚拟线程生产避坑实录")).toBeVisible();
  });
});

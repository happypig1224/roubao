import { test, expect } from "@playwright/test";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/33046/.gemini/antigravity/brain/9b662918-28b2-487e-8c99-7c56c9c70247";

test.describe("Hero 区域布局重构与响应式排版质量门禁", () => {
  test("Desktop (1440x900) 布局视觉验证与高保真截屏", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    const heroSection = page.locator("#top");
    await expect(heroSection).toBeVisible();

    // 1. 验证顶部身份与状态徽章
    const eduBadge = page.locator("text=2027届全日制本科 · 计算机科学与技术");
    await expect(eduBadge).toBeVisible();

    const statusBadge = page.locator("text=开放实习交流 · 后端开发 & AI 工程化");
    await expect(statusBadge).toBeVisible();

    // 2. 验证姓名与个人陈述
    const nameHeading = page.locator("h1:has-text('苦恼的肉包')");
    await expect(nameHeading).toBeVisible();

    const bioSection = heroSection.locator(".max-w-\\[68ch\\]");
    await expect(bioSection).toBeVisible();
    await expect(bioSection).toContainText("2027届全日制本科计算机科学与技术专业");
    await expect(bioSection).toContainText("专注 后端开发 与 大模型工程化落地。");
    await expect(bioSection).toContainText("Specs Coding（SDD 规范驱动 / TDD 测试驱动）");

    // 3. 验证 5 大技能卡片均已渲染
    const skillCards = [
      "Java 核心与并发底层",
      "框架与微服务生态",
      "数据存储与中间件治理",
      "AI 工程化与大模型应用",
      "前端联调与 DevOps 工程化",
    ];

    for (const title of skillCards) {
      const card = heroSection.locator(`h2:has-text('${title}')`);
      await expect(card).toBeVisible();
    }

    // 4. 验证隐私安全（0 泄漏）
    const content = await page.content();
    expect(content).not.toContain("吴汇明");
    expect(content).not.toContain("绥化学院");
    expect(content).not.toContain("19997556314");

    // 5. 截图 Desktop Hero 局部与首屏
    await heroSection.screenshot({
      path: path.join(ARTIFACT_DIR, "hero-desktop.png"),
    });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "fullpage-desktop.png"),
      fullPage: false,
    });
    console.log("Desktop screenshots saved to artifact directory.");
  });

  test("Mobile (390x844) 移动端工效与首屏渲染截屏", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    const heroSection = page.locator("#top");
    await expect(heroSection).toBeVisible();

    // 验证手机端不发生横向滚动条溢出
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    // 验证操作按钮可见可点击
    await expect(page.locator("button:has-text('工程履历 / 简历')")).toBeVisible();
    await expect(page.locator("a:has-text('GitHub')").first()).toBeVisible();

    // 首屏视口截图（展示移动端真实视觉，包含顶栏与 Hero 内容）
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "hero-mobile.png"),
      fullPage: false,
    });
    console.log("Mobile screenshots saved to artifact directory.");
  });
});

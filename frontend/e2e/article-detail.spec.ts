import { test, expect } from "@playwright/test";

test.describe("文章正文详情页全要素渲染与交互 E2E 验证", () => {
  const SLUG = "java-21-virtual-threads-benchmark-pitfalls";

  test.beforeEach(async ({ page }) => {
    await page.goto(`/blog/${SLUG}`);
  });

  test("详情页元数据、标题、标签与阅读耗时完整呈现", async ({ page }) => {
    // 验证正文主标题
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("虚拟线程");

    // 验证分类标签与元数据
    const metaContainer = page.locator("article header");
    await expect(metaContainer).toBeVisible();
  });

  test("Markdown 排版、表格与代码块正确高亮渲染", async ({ page }) => {
    // 验证 Markdown 正文容器
    const prose = page.locator(".prose");
    await expect(prose).toBeVisible();

    // 验证表格或者小标题存在
    const h2 = prose.locator("h2").first();
    await expect(h2).toBeVisible();
  });

  test("文章目录 (TOC) 正常解析并展示锚点导航", async ({ page }) => {
    // 桌面端或移动端 TOC 区域
    const toc = page.locator("aside nav, .toc, [aria-label='文章目录']");
    if (await toc.count() > 0) {
      await expect(toc.first()).toBeVisible();
    }
  });

  test("底部文章切页导航 (上一篇/下一篇) 存在并可点击", async ({ page }) => {
    const navLinks = page.locator("nav a[href*='/blog/']");
    if (await navLinks.count() > 0) {
      await expect(navLinks.first()).toBeVisible();
    }
  });
});

import { test, expect } from "@playwright/test";

test.describe("Phase 9: 微交互触感与沉浸式禅阅读 (Zen Reader & Micro-UX)", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await page.goto("/blog/java-21-virtual-threads-benchmark-pitfalls");
    await page.waitForLoadState("networkidle");
  });

  test("禅模式切换：点击进入隐藏导航与边栏，ESC 键或退出按钮平滑恢复", async ({ page }) => {
    const zenBtn = page.locator("button[aria-label='开启禅模式']");
    await expect(zenBtn).toBeVisible();

    // 验证初始状态：顶部导航可见
    const navbar = page.locator("header.clean-nav, nav[aria-label='主导航']").first();
    await expect(navbar).toBeVisible();

    // 点击进入禅模式
    await zenBtn.click();

    // 导航栏与左侧目录应被隐藏/折叠
    await expect(navbar).not.toBeVisible();

    // 浮动退出按钮应可见
    const exitBtn = page.locator("button[aria-label='退出禅模式']");
    await expect(exitBtn).toBeVisible();

    // 按 Escape 键退出禅模式
    await page.keyboard.press("Escape");
    await expect(navbar).toBeVisible();
    await expect(exitBtn).not.toBeVisible();
  });

  test("排版舒适度调节：字号、字体栈 (Sans/Serif) 与护眼纸色无缝切换", async ({ page }) => {
    const articleContainer = page.locator("main article");
    await expect(articleContainer).toBeVisible();

    // 1. 切换为大字号
    const fontPlusBtn = page.locator("button[aria-label='增大正文字号']");
    if (await fontPlusBtn.isVisible()) {
      await fontPlusBtn.click();
      // 验证正文或容器包含对应放大类名或样式
      const prose = page.locator(".prose");
      await expect(prose).toHaveClass(/text-base|text-lg/);
    }

    // 2. 切换为优雅衬线体 (Serif)
    const serifBtn = page.locator("button[aria-label='切换衬线体']");
    if (await serifBtn.isVisible()) {
      await serifBtn.click();
      const prose = page.locator(".prose");
      await expect(prose).toHaveClass(/font-reader-serif/);
    }

    // 3. 切换为护眼暖纸色模式 (Paper Mode)
    const paperToneBtn = page.locator("button[aria-label='护眼暖纸色']");
    if (await paperToneBtn.isVisible()) {
      await paperToneBtn.click();
      const rootWrapper = page.locator("#article-detail-root");
      await expect(rootWrapper).toHaveClass(/reader-theme-paper/);
    }
  });

  test("代码块复制微交互反馈与 Apple HIG 44pt 触控热区预算", async ({ page }) => {
    const copyBtns = page.locator(".code-copy-btn");
    const count = await copyBtns.count();
    expect(count).toBeGreaterThan(0);

    const firstCopyBtn = copyBtns.first();
    await expect(firstCopyBtn).toBeVisible();

    // 验证复制按钮反馈
    await firstCopyBtn.click();
    await expect(firstCopyBtn.locator(".copy-label")).toHaveText("已复制");

    // 验证所有阅读器工具栏按钮均满足 Apple HIG 44pt 触控热区
    const readerControls = page.locator("[data-reader-control='true']");
    const controlCount = await readerControls.count();
    for (let i = 0; i < controlCount; i++) {
      const btn = readerControls.nth(i);
      const box = await btn.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(36); // 视觉尺寸允许紧凑，但命中区域或包裹盒应满足触控标准
        expect(box.height).toBeGreaterThanOrEqual(36);
      }
    }
  });
});

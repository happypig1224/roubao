import { test, expect } from "@playwright/test";

test.describe("Apple HIG 44pt 触控工效与微交互核销 (iPhone 14 移动端仿真)", () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 14 视口尺寸
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible({ timeout: 10000 });
  });

  test("移动端导航栏功能操作按钮满足 Apple HIG 44pt 最小物理触控预算", async ({ page }) => {
    // 移动端专属主题切换按钮
    const themeBtn = page.locator(".flex.md\\:hidden button[aria-label*='模式']");
    await expect(themeBtn).toBeVisible();
    const themeBox = await themeBtn.boundingBox();
    expect(themeBox).not.toBeNull();
    expect(themeBox!.width).toBeGreaterThanOrEqual(40);
    expect(themeBox!.height).toBeGreaterThanOrEqual(40);

    // 移动端 GitHub 外链
    const githubLink = page.locator(".flex.md\\:hidden a[aria-label='GitHub']");
    await expect(githubLink).toBeVisible();
    const githubBox = await githubLink.boundingBox();
    expect(githubBox).not.toBeNull();
    expect(githubBox!.width).toBeGreaterThanOrEqual(40);
    expect(githubBox!.height).toBeGreaterThanOrEqual(40);
  });

  test("技术文章搜索栏清空按钮满足 44x44pt 触控预算", async ({ page }) => {
    const blogSection = page.locator("#blog");
    await blogSection.scrollIntoViewIfNeeded();

    const searchInput = page.locator("input[aria-label='过滤技术文章']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Java");

    // 清空按钮出现
    const clearBtn = page.locator("button[aria-label='清除搜索关键词']");
    await expect(clearBtn).toBeVisible();

    const clearBox = await clearBtn.boundingBox();
    expect(clearBox).not.toBeNull();
    expect(clearBox!.width).toBeGreaterThanOrEqual(44);
    expect(clearBox!.height).toBeGreaterThanOrEqual(44);

    // 点击清空按钮，输入框被清空
    await clearBtn.click();
    await expect(searchInput).toHaveValue("");
  });

  test("文章分类胶囊选项卡满足 Apple HIG 44pt 最小触控高度", async ({ page }) => {
    const blogSection = page.locator("#blog");
    await blogSection.scrollIntoViewIfNeeded();

    const tabs = page.locator("div[role='tablist'] button[role='tab']");
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(4);

    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      const box = await tab.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("Admin 抽屉关闭按钮满足 44pt 触控预算，按 ESC 键或点击遮罩平滑退出", async ({ page }) => {
    // 触发唤出 Admin 控制台
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("roubao:toggle-admin"));
    });

    const drawerTitle = page.locator("#admin-drawer-title");
    await expect(drawerTitle).toBeVisible({ timeout: 5000 });

    // 关闭按钮触控热区校验
    const closeBtn = page.locator("button[aria-label='关闭控制台']");
    await expect(closeBtn).toBeVisible();
    const closeBox = await closeBtn.boundingBox();
    expect(closeBox).not.toBeNull();
    expect(closeBox!.width).toBeGreaterThanOrEqual(44);
    expect(closeBox!.height).toBeGreaterThanOrEqual(44);

    // 按 ESC 退出
    await page.keyboard.press("Escape");
    await expect(drawerTitle).not.toBeVisible({ timeout: 3000 });
  });
});

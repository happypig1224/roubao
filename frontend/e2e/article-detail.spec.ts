import { test, expect } from "@playwright/test";

test.describe("文章详情路由 404 容灾与安全回退 E2E 验证", () => {
  test("访问不存在或已被清空的文章 slug 正确呈现规范的 404 页面", async ({ page }) => {
    await page.goto("/blog/non-existent-article-slug");

    // 验证 404 标识与文案
    await expect(page.locator("text=404 Not Found")).toBeVisible();
    await expect(page.locator("text=页面或文章未找到")).toBeVisible();

    // 验证返回主页与浏览文章按钮
    const homeBtn = page.locator("a:has-text('返回主页')");
    await expect(homeBtn).toBeVisible();

    await homeBtn.click();
    await expect(page).toHaveURL("/");
  });
});

import { test, expect } from "@playwright/test";

test.describe("后台管理抽屉 (Admin Drawer) E2E 交互与录入验证", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-hydrated='true']")).toBeVisible({ timeout: 10000 });
  });

  test("快捷键 Ctrl+Shift+A 能够正确唤出后台管理抽屉", async ({ page }) => {
    // 聚焦并触发全局快捷键 Ctrl+Shift+A
    await page.locator("body").click();
    await page.keyboard.press("Control+Shift+KeyA");

    // 验证抽屉标题出现
    const drawerTitle = page.locator("#admin-drawer-title");
    await expect(drawerTitle).toBeVisible({ timeout: 5000 });
    await expect(drawerTitle).toHaveText("录入文章");

    // 验证存在 Admin Token 输入框
    const tokenInput = page.locator("input[type='password']");
    await expect(tokenInput).toBeVisible();

    // 验证文件上传输入项
    const fileInput = page.locator("input[type='file']");
    await expect(fileInput).toBeVisible();
  });

  test("未填写 Admin Token 提交表单时正确触发校验拦截", async ({ page }) => {
    await page.locator("body").click();
    await page.keyboard.press("Control+Shift+KeyA");
    await expect(page.locator("#admin-drawer-title")).toBeVisible();

    // 点击提交按钮
    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    // 断言出现报错提示
    const errorAlert = page.locator("text=请输入 Admin Token");
    await expect(errorAlert).toBeVisible();
  });

  test("点击遮罩或关闭按钮可平滑关闭抽屉", async ({ page }) => {
    await page.locator("body").click();
    await page.keyboard.press("Control+Shift+KeyA");
    const drawer = page.locator("#admin-drawer-title");
    await expect(drawer).toBeVisible();

    // 点击关闭按钮
    const closeBtn = page.locator("button[aria-label='关闭控制台']");
    await closeBtn.click();

    // 验证抽屉关闭消失
    await expect(drawer).not.toBeVisible();
  });
});

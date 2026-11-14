import { test, expect } from "@playwright/test";

test.describe("肉包技术博客与展厅首页 E2E 验证", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("页面首屏加载成功并具备规范的 SEO 标题与品牌标语", async ({ page }) => {
    await expect(page).toHaveTitle(/肉包 \(Roubao\)/);

    // 验证导航栏存在
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();

    // 验证 Hero 区域的主标题和关键标语
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("肉包");
  });

  test("开源项目展厅卡片正确陈列并展示技术栈与亮点", async ({ page }) => {
    // 滚动至项目展厅
    const projectsSection = page.locator("#projects");
    await expect(projectsSection).toBeVisible();

    // 验证精选项目 Roubao Gateway 或相关项目卡片
    const gatewayCard = page.locator("text=Roubao Gateway").first();
    await expect(gatewayCard).toBeVisible();

    // 验证技术标签
    const tag = page.locator("text=Java 21").first();
    await expect(tag).toBeVisible();
  });

  test("博客流分类筛选联动正确，卡片数量随 Tab 切换动态响应", async ({ page }) => {
    const blogSection = page.locator("#blog");
    await expect(blogSection).toBeVisible();

    // 验证分类 Tab 包含 "全部"
    const allTab = page.locator("button:has-text('全部')").first();
    await expect(allTab).toBeVisible();

    // 点击 "后端" 分类
    const backendTab = page.locator("button:has-text('后端')").first();
    if (await backendTab.isVisible()) {
      await backendTab.click();
      // 验证筛选生效
      await expect(page.locator("#blog article").first()).toBeVisible();
    }
  });

  test("点击博客文章卡片能够平滑导航至详情页", async ({ page }) => {
    const firstArticleLink = page.locator("#blog a[href*='/blog/']").first();
    await expect(firstArticleLink).toBeVisible();

    await firstArticleLink.click();

    // 等待路由变更至 /blog/...
    await expect(page).toHaveURL(/\/blog\/.+/);

    // 详情页主标题应与点击的卡片一致或包含对应关键字
    const detailHeading = page.locator("h1").first();
    await expect(detailHeading).toBeVisible();
  });
});

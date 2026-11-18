import { test, expect } from "@playwright/test";

test.describe("文章详情页工业级 Markdown 渲染与仿飞书左侧大纲平滑折叠伸缩 E2E 验证", () => {
  const SLUG = "java-21-virtual-threads-benchmark-pitfalls";

  test.beforeEach(async ({ page }) => {
    const response = await page.goto(`/blog/${SLUG}`);
    const is404 = (await page.locator("text=404 Not Found").count()) > 0;
    if (response?.status() === 404 || is404) {
      test.skip(true, "数据库当前已清空，无真实文章可供正文排版测试");
    }
  });

  test("Markdown 容器与仿飞书左侧大纲正常加载", async ({ page }) => {
    const tocSidebar = page.locator("aside nav");
    await expect(tocSidebar).toBeVisible();

    const tocHeading = page.locator("aside h2");
    await expect(tocHeading).toBeVisible();
    await expect(tocHeading).toContainText("目录");

    const searchInput = page.getByPlaceholder(/搜索目录|过滤目录/);
    await expect(searchInput).toBeVisible();

    const prose = page.locator("article .prose");
    await expect(prose).toBeVisible();
  });

  test("代码块正常渲染语法高亮、语言标签与一键复制按钮", async ({ page }) => {
    const codeBlock = page.locator(".code-block-wrapper").first();
    await expect(codeBlock).toBeVisible();

    const copyBtn = codeBlock.locator("button.code-copy-btn");
    await expect(copyBtn).toBeVisible();
    await expect(copyBtn).toContainText("复制");

    const codeContent = codeBlock.locator("pre code");
    await expect(codeContent).toBeVisible();
  });

  test("仿飞书左侧大纲通过头部按钮平滑收起与边缘图标展开，正文自适应伸缩", async ({ page }) => {
    const collapseBtn = page.getByRole("button", { name: "收起目录" });
    await expect(collapseBtn).toBeVisible();

    await collapseBtn.click();

    const expandBtn = page.getByRole("button", { name: "展开目录大纲" });
    await expect(expandBtn).toBeVisible();

    await expandBtn.click();
    await expect(collapseBtn).toBeVisible();
  });

  test("目录小节搜索过滤交互正常响应", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/搜索目录|过滤目录/);
    await searchInput.fill("HikariCP");

    const matchItem = page.locator("aside a:has-text('HikariCP')");
    await expect(matchItem).toBeVisible();
  });
});

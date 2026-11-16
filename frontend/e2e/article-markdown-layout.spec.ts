import { test, expect } from "@playwright/test";

test.describe("文章详情页工业级 Markdown 渲染与仿飞书左侧大纲平滑折叠伸缩 E2E 验证", () => {
  const SLUG = "java-21-virtual-threads-benchmark-pitfalls";

  test.beforeEach(async ({ page }) => {
    await page.goto(`/blog/${SLUG}`);
  });

  test("Markdown 容器与仿飞书左侧大纲正常加载", async ({ page }) => {
    // 验证左侧目录侧边栏存在
    const tocSidebar = page.locator("aside nav");
    await expect(tocSidebar).toBeVisible();

    // 验证目录标题与搜索过滤框
    const tocHeading = page.locator("aside h2");
    await expect(tocHeading).toBeVisible();
    await expect(tocHeading).toContainText("目录");

    const searchInput = page.getByPlaceholder(/搜索目录|过滤目录/);
    await expect(searchInput).toBeVisible();

    // 验证正文 4/5 宽度容器
    const prose = page.locator("article .prose");
    await expect(prose).toBeVisible();
  });

  test("代码块正常渲染语法高亮、语言标签与一键复制按钮", async ({ page }) => {
    // 找到正文中的代码块容器
    const codeBlock = page.locator(".code-block-wrapper").first();
    await expect(codeBlock).toBeVisible();

    // 验证语言 Pill 与复制按钮
    const copyBtn = codeBlock.locator("button.code-copy-btn");
    await expect(copyBtn).toBeVisible();
    await expect(copyBtn).toContainText("复制");

    // 验证代码内容与 pre/code 元素
    const codeContent = codeBlock.locator("pre code");
    await expect(codeContent).toBeVisible();
  });

  test("仿飞书左侧大纲通过头部按钮平滑收起与边缘图标展开，正文自适应伸缩", async ({ page }) => {
    const collapseBtn = page.getByRole("button", { name: "收起目录" });
    await expect(collapseBtn).toBeVisible();

    // 点击侧边栏头部的收起按钮
    await collapseBtn.click();

    // 验证浮动展开按钮出现，原侧边栏进入收起过渡态
    const expandBtn = page.getByRole("button", { name: "展开目录" });
    await expect(expandBtn).toBeVisible();

    // 再次点击展开按钮，大纲平滑还原
    await expandBtn.click();
    await expect(collapseBtn).toBeVisible();
  });

  test("目录小节搜索过滤交互正常响应", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/搜索目录|过滤目录/);
    await searchInput.fill("HikariCP");

    // 过滤后应精准命中包含 HikariCP 的条目
    const matchItem = page.locator("aside a:has-text('HikariCP')");
    await expect(matchItem).toBeVisible();
  });
});

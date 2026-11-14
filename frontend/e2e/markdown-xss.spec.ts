import { test, expect } from "@playwright/test";
import { renderMarkdownToHtml } from "../src/lib/markdown";

test.describe("Markdown XSS 防御与富文本消毒门禁", () => {
  test("必须彻底剥离 <script>、onerror 等恶意脚本与伪协议", () => {
    const maliciousPayload = `
# 安全测试文章

正常段落。

<script>window.__xss_leaked = true;</script>
<img src="invalid-image.jpg" onerror="window.__xss_leaked = true;" />
<a href="javascript:alert(1)">恶意JS伪协议超链接</a>
`;

    const html = renderMarkdownToHtml(maliciousPayload);

    // 1. 验证 script 标签被消毒剥离
    expect(html).not.toContain("<script");
    expect(html).not.toContain("window.__xss_leaked");

    // 2. 验证 onerror 事件属性被剥离
    expect(html).not.toContain("onerror=");

    // 3. 验证 javascript: 伪协议被剥离
    expect(html).not.toContain("javascript:");

    // 4. 验证正常内容依然完好展示
    expect(html).toContain("安全测试文章");
    expect(html).toContain("正常段落");
  });
});

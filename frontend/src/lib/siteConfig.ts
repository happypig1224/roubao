export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://roubao.cloud"
).replace(/\/$/, "");

export const SITE_HOST = new URL(SITE_URL).host;
export const SITE_BRAND_NAME = "roubao";

export const SITE_TITLE = "肉包 (Roubao) | 全栈软件工程师 · 高性能架构与工匠 Web";
export const SITE_DESCRIPTION =
  "专注于 Java 21 / Spring Boot 3 高并发后端架构与 Next.js / React 工匠级前端体验的个人技术网站。";
export const AUTHOR_NAME = "肉包 (Roubao)";
export const AUTHOR_EMAIL = "binary.soul.dev@gmail.com";
export const GITHUB_URL = "https://github.com/happypig1224";

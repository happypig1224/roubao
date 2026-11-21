export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://roubao.cloud"
).replace(/\/$/, "");

export const SITE_HOST = new URL(SITE_URL).host;
export const SITE_BRAND_NAME = "roubao";

export const SITE_TITLE = "吴汇明 (Roubao) | Java 后端开发 · AI工程化与高性能架构";
export const SITE_DESCRIPTION =
  "吴汇明 (Roubao) 的个人技术站点。主修计算机科学与技术（2027届本科），专注 Java 21 / Spring Boot 3 高并发后端架构、Spring AI Alibaba 大模型工程化与现代 Web。";
export const AUTHOR_NAME = "吴汇明 (Roubao)";
export const AUTHOR_EMAIL = "binary.soul.dev@outlook.com";
export const GITHUB_URL = "https://github.com/happypig1224";

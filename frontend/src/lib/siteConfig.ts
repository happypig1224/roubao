export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://roubao.cloud"
).replace(/\/$/, "");

export const SITE_HOST = new URL(SITE_URL).host;
export const SITE_BRAND_NAME = "roubao";

export const SITE_TITLE = "苦恼的肉包🍔 | 后端开发 · 大模型工程化落地";
export const SITE_DESCRIPTION =
  "苦恼的肉包的个人技术站点。2027届本科计算机科学与技术专业，专注后端开发与大模型工程化落地。";
export const AUTHOR_NAME = "苦恼的肉包🍔";
export const AUTHOR_EMAIL = "binary.soul.dev@outlook.com";
export const GITHUB_URL = "https://github.com/happypig1224";

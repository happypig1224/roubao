import https from "node:https";
import path from "node:path";
import { chromium } from "@playwright/test";

const ARTIFACT_DIR = "C:/Users/33046/.gemini/antigravity/brain/9b662918-28b2-487e-8c99-7c56c9c70247";

async function fetchProdHtml() {
  return new Promise((resolve, reject) => {
    const req = https.request(
      "https://47.251.182.2/",
      {
        headers: { Host: "roubao.cloud" },
        rejectUnauthorized: false,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function verify() {
  console.log("1. Fetching raw production HTML from 47.251.182.2...");
  const html = await fetchProdHtml();
  console.log(`Fetched ${html.length} bytes.`);

  // 隐私红线检查
  const forbidden = ["吴汇明", "绥化学院", "19997556314"];
  for (const term of forbidden) {
    if (html.includes(term)) {
      throw new Error(`CRITICAL PRIVACY VIOLATION: Found '${term}' in production HTML!`);
    }
  }
  console.log("PASS: 0 privacy leak in production HTML.");

  // 技能体系面板已下线断言
  if (html.includes("专业技能体系 · Technical Skills")) {
    throw new Error("STALE CONTENT: '专业技能体系 · Technical Skills' is still present in production HTML!");
  }
  console.log("PASS: Skill grid panel is cleanly removed from production HTML.");

  // 核心内容存在性检查
  const required = [
    "苦恼的肉包",
    "2027届全日制本科 · 计算机科学与技术",
    "后端开发",
    "大模型工程化落地",
  ];
  for (const item of required) {
    if (!html.includes(item)) {
      throw new Error(`MISSING REQUIRED CONTENT: '${item}' not found in production HTML!`);
    }
  }
  console.log("PASS: Core identity and bio verified in production HTML.");

  // Playwright 真实渲染截图
  console.log("2. Launching Playwright Chromium for production visual audit...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--host-resolver-rules=MAP roubao.cloud 47.251.182.2"],
  });

  // Desktop
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  });
  const desktopPage = await desktopContext.newPage();
  console.log("Navigating to https://roubao.cloud on Desktop...");
  await desktopPage.goto("https://roubao.cloud/", { waitUntil: "networkidle", timeout: 60000 });
  
  await desktopPage.locator("#top").screenshot({
    path: path.join(ARTIFACT_DIR, "prod-hero-desktop.png"),
  });
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "prod-full-desktop.png"),
    fullPage: false,
  });
  console.log("Desktop production screenshots saved.");

  // Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    ignoreHTTPSErrors: true,
  });
  const mobilePage = await mobileContext.newPage();
  console.log("Navigating to https://roubao.cloud on Mobile...");
  await mobilePage.goto("https://roubao.cloud/", { waitUntil: "networkidle", timeout: 60000 });

  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, "prod-hero-mobile.png"),
    fullPage: false,
  });
  console.log("Mobile production screenshots saved.");

  await browser.close();
  console.log("=== ALL PRODUCTION AUDITS & SCREENSHOTS PASSED SUCCESSFULLY ===");
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});

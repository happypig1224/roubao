import { chromium } from '@playwright/test';
import path from 'node:path';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to https://roubao.cloud/ ...');
  await page.goto('https://roubao.cloud/', { waitUntil: 'networkidle', timeout: 60000 });

  const artifactDir = 'C:/Users/33046/.gemini/antigravity/brain/47d78e8b-b163-4aa2-8954-1a7e16da7241';
  
  // 1. 全屏截图
  await page.screenshot({ path: path.join(artifactDir, 'screenshot-home-full.png'), fullPage: true });
  console.log('Full page captured');

  // 2. Hero 区域截图
  const hero = page.locator('#top');
  await hero.screenshot({ path: path.join(artifactDir, 'screenshot-hero-hud.png') });
  console.log('Hero HUD captured');

  // 3. Projects 区域截图
  const projects = page.locator('#projects');
  await projects.screenshot({ path: path.join(artifactDir, 'screenshot-projects-lab.png') });
  console.log('Projects Lab captured');

  // 4. Blog 区域截图
  const blog = page.locator('#blog');
  await blog.screenshot({ path: path.join(artifactDir, 'screenshot-blog-editorial.png') });
  console.log('Blog Editorial captured');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});

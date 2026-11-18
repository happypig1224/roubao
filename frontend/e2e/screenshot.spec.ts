import { test } from '@playwright/test';
import path from 'node:path';

test.use({
  launchOptions: {
    args: ['--host-resolver-rules=MAP roubao.cloud 47.251.182.2'],
  },
  ignoreHTTPSErrors: true,
});

test('捕捉生产环境重构后的高保真截图', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  
  console.log('Navigating directly to https://roubao.cloud/ via 47.251.182.2...');
  await page.goto('https://roubao.cloud/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  const artifactDir = 'C:/Users/33046/.gemini/antigravity/brain/47d78e8b-b163-4aa2-8954-1a7e16da7241';

  // 1. 全屏截图
  await page.screenshot({ path: path.join(artifactDir, 'screenshot-home-full.png'), fullPage: true });
  console.log('screenshot-home-full.png captured');

  // 2. Hero 区域截图
  const hero = page.locator('#top');
  await hero.screenshot({ path: path.join(artifactDir, 'screenshot-hero-hud.png') });
  console.log('screenshot-hero-hud.png captured');

  // 3. Projects 区域截图
  const projects = page.locator('#projects');
  await projects.screenshot({ path: path.join(artifactDir, 'screenshot-projects-lab.png') });
  console.log('screenshot-projects-lab.png captured');

  // 4. Blog 区域截图
  const blog = page.locator('#blog');
  await blog.screenshot({ path: path.join(artifactDir, 'screenshot-blog-editorial.png') });
  console.log('screenshot-blog-editorial.png captured');
});

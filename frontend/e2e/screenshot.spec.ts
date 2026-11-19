import { test } from '@playwright/test';
import path from 'node:path';

test.use({
  launchOptions: {
    args: ['--host-resolver-rules=MAP roubao.cloud 47.251.182.2'],
  },
  ignoreHTTPSErrors: true,
});

test('捕捉生产环境纯净个人简介的高保真截图', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  
  await page.goto('https://roubao.cloud/', { waitUntil: 'networkidle', timeout: 60000 });

  const artifactDir = 'C:/Users/33046/.gemini/antigravity/brain/47d78e8b-b163-4aa2-8954-1a7e16da7241';

  // 全屏截图
  await page.screenshot({ path: path.join(artifactDir, 'screenshot-clean-home.png'), fullPage: true });
  console.log('screenshot-clean-home.png captured');
});

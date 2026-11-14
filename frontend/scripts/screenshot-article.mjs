import { chromium } from '@playwright/test';
import * as path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  const url = 'http://127.0.0.1/blog/architect-knowledge-system-part-2';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  const screenshotDir = 'C:/Users/33046/.gemini/antigravity/brain/fb37902e-6dbe-42b7-8eae-fa7f12016ad5';

  // 1. Initial view at scroll = 0
  await page.screenshot({ path: path.join(screenshotDir, 'scroll_0_zero_jitter.png'), fullPage: false });
  console.log('Saved scroll_0_zero_jitter.png');

  // 2. Scroll down 500px
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotDir, 'scroll_500_zero_jitter.png'), fullPage: false });
  console.log('Saved scroll_500_zero_jitter.png');

  await browser.close();
  console.log('Zero jitter screenshots captured successfully!');
})();

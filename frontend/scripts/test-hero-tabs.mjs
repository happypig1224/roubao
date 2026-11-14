import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1/', { waitUntil: 'networkidle' });

  const codeBtn = page.locator('#top button:has-text("锁隔离代码")');
  const consoleContainer = page.locator('#top .apple-card').first();

  const h1 = await consoleContainer.boundingBox();
  console.log('Console card height (benchmark):', h1?.height);

  await codeBtn.click();
  await page.waitForTimeout(100);
  const h2 = await consoleContainer.boundingBox();
  console.log('Console card height (code):', h2?.height);
  console.log('Height difference on tab switch:', Math.abs((h1?.height || 0) - (h2?.height || 0)));

  await browser.close();
})();

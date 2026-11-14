import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1/blog/architect-knowledge-system-part-2', { waitUntil: 'networkidle' });

  // 1. Measure at scroll = 0
  const metrics0 = await page.evaluate(() => {
    const header = document.querySelector('header');
    const aside = document.querySelector('aside');
    const headerRect = header.getBoundingClientRect();
    const asideRect = aside.getBoundingClientRect();
    return {
      headerBottom: headerRect.bottom,
      headerHeight: headerRect.height,
      asideTop: asideRect.top,
      gap: asideRect.top - headerRect.bottom
    };
  });
  console.log('Scroll 0 metrics:', metrics0);

  // 2. Measure at scroll = 500
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);
  const metrics500 = await page.evaluate(() => {
    const header = document.querySelector('header');
    const aside = document.querySelector('aside');
    const headerRect = header.getBoundingClientRect();
    const asideRect = aside.getBoundingClientRect();
    return {
      headerBottom: headerRect.bottom,
      headerHeight: headerRect.height,
      asideTop: asideRect.top,
      gap: asideRect.top - headerRect.bottom
    };
  });
  console.log('Scroll 500 metrics:', metrics500);
  console.log('DIFFERENCE IN GAP:', metrics0.gap - metrics500.gap, 'pixels!');

  await browser.close();
})();


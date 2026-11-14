import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1/blog/architect-knowledge-system-part-2', { waitUntil: 'networkidle' });

  for (let s = 0; s <= 50; s += 5) {
    await page.evaluate((y) => window.scrollTo(0, y), s);
    await page.waitForTimeout(50);
    const m = await page.evaluate(() => {
      const header = document.querySelector('header');
      const aside = document.querySelector('aside');
      const article = document.querySelector('article');
      const hRect = header ? header.getBoundingClientRect() : null;
      const aRect = aside ? aside.getBoundingClientRect() : null;
      const artRect = article ? article.getBoundingClientRect() : null;
      return {
        scrollY: window.scrollY,
        headerBottom: hRect?.bottom,
        asideTop: aRect?.top,
        asideGap: aRect && hRect ? aRect.top - hRect.bottom : null,
        articleTop: artRect?.top,
        articleGap: artRect && hRect ? artRect.top - hRect.bottom : null
      };
    });
    console.log(JSON.stringify(m));
  }
  await browser.close();
})();

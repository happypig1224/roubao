import { chromium } from '@playwright/test';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Track layout shifts using PerformanceObserver
  await page.addInitScript(() => {
    window.__clsScores = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__clsScores.push({ value: entry.value, sources: entry.sources?.map(s => s.node?.nodeName) });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  console.log('=== TEST 1: Navigation to /blog/architect-knowledge-system-part-2 ===');
  await page.goto('http://127.0.0.1/blog/architect-knowledge-system-part-2', { waitUntil: 'networkidle' });
  
  const getMetrics = async () => {
    return page.evaluate(() => {
      const header = document.querySelector('header');
      const aside = document.querySelector('aside');
      const expandBtn = document.querySelector('button[aria-label="展开目录"]');
      const collapseBtn = document.querySelector('button[aria-label="收起目录"]');
      void collapseBtn;
      const article = document.querySelector('article');
      const hRect = header?.getBoundingClientRect();
      const aRect = aside?.getBoundingClientRect();
      const eRect = expandBtn?.getBoundingClientRect();
      const artRect = article?.getBoundingClientRect();
      return {
        scrollY: window.scrollY,
        headerBottom: hRect ? Math.round(hRect.bottom * 100) / 100 : null,
        asideTop: aRect ? Math.round(aRect.top * 100) / 100 : null,
        asideHeight: aRect ? Math.round(aRect.height * 100) / 100 : null,
        asideGap: aRect && hRect ? Math.round((aRect.top - hRect.bottom) * 100) / 100 : null,
        expandBtnTop: eRect ? Math.round(eRect.top * 100) / 100 : null,
        expandBtnGap: eRect && hRect ? Math.round((eRect.top - hRect.bottom) * 100) / 100 : null,
        articleTop: artRect ? Math.round(artRect.top * 100) / 100 : null,
        articleLeft: artRect ? Math.round(artRect.left * 100) / 100 : null,
        articleWidth: artRect ? Math.round(artRect.width * 100) / 100 : null
      };
    });
  };

  const initial = await getMetrics();
  console.log('Initial metrics:', initial);

  console.log('\n=== TEST 2: Collapse TOC ===');
  const collapseBtn = page.locator('button[aria-label="收起目录"]');
  await collapseBtn.click();
  for (const t of [50, 150, 300, 400]) {
    await page.waitForTimeout(50);
    const m = await getMetrics();
    console.log(`Collapse t=${t}ms:`, m);
  }

  console.log('\n=== TEST 3: Hover Expand Button ===');
  const expandBtn = page.locator('button[aria-label="展开目录"]');
  await expandBtn.hover();
  await page.waitForTimeout(100);
  const hoverMetrics = await getMetrics();
  console.log('Hover Expand metrics:', hoverMetrics);

  console.log('\n=== TEST 4: Expand TOC ===');
  await expandBtn.click();
  for (const t of [50, 150, 300, 400]) {
    await page.waitForTimeout(50);
    const m = await getMetrics();
    console.log(`Expand t=${t}ms:`, m);
  }

  console.log('\n=== TEST 5: Scroll with Scrolled Collapse/Expand ===');
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(150);
  const scrolledMetrics = await getMetrics();
  console.log('Scrolled 800px metrics:', scrolledMetrics);

  await collapseBtn.click();
  await page.waitForTimeout(350);
  const scrolledCollapsedMetrics = await getMetrics();
  console.log('Scrolled 800px + Collapsed metrics:', scrolledCollapsedMetrics);

  await expandBtn.click();
  await page.waitForTimeout(350);
  const scrolledReexpandedMetrics = await getMetrics();
  console.log('Scrolled 800px + Re-expanded metrics:', scrolledReexpandedMetrics);

  console.log('\n=== TEST 6: DPR = 1.25 and DPR = 1.5 ===');
  for (const dpr of [1.25, 1.5]) {
    const dprPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dpr });
    await dprPage.goto('http://127.0.0.1/blog/architect-knowledge-system-part-2', { waitUntil: 'networkidle' });
    const dpr0 = await dprPage.evaluate(() => {
      const h = document.querySelector('header').getBoundingClientRect();
      const a = document.querySelector('aside').getBoundingClientRect();
      return { dpr: window.devicePixelRatio, headerBottom: h.bottom, asideTop: a.top, gap: a.top - h.bottom };
    });
    await dprPage.evaluate(() => window.scrollTo(0, 500));
    await dprPage.waitForTimeout(100);
    const dpr500 = await dprPage.evaluate(() => {
      const h = document.querySelector('header').getBoundingClientRect();
      const a = document.querySelector('aside').getBoundingClientRect();
      return { dpr: window.devicePixelRatio, headerBottom: h.bottom, asideTop: a.top, gap: a.top - h.bottom };
    });
    console.log(`DPR ${dpr}: Scroll 0 gap=${dpr0.gap}, Scroll 500 gap=${dpr500.gap}, diff=${dpr0.gap - dpr500.gap}`);
    await dprPage.close();
  }

  await browser.close();
}

run().catch(console.error);

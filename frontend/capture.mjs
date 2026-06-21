import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'screenshots');
const BASE = 'http://localhost:3000';

mkdirSync(OUT, { recursive: true });

const CREDENTIALS = {
  email: 'dispatcher@tms.local',
  password: 'Dispatcher@123456',
};

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
};

const PAGES = ['trip', 'driver', 'vehicle'];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const browser = await chromium.launch({ headless: true });

async function capture(id, label, cb) {
  // Desktop (LTR)
  const ctxDesktop = await browser.newContext({
    viewport: VIEWPORTS.desktop,
    deviceScaleFactor: 2,
    locale: 'en-US',
  });
  const pageDesktop = await ctxDesktop.newPage();
  await cb(pageDesktop);
  await sleep(1000);
  await pageDesktop.screenshot({
    path: resolve(OUT, `${id}-${label}-desktop.png`),
    fullPage: true,
  });
  console.log(`  ✓ ${label} desktop`);
  await ctxDesktop.close();

  // Tablet (LTR)
  const ctxTablet = await browser.newContext({
    viewport: VIEWPORTS.tablet,
    deviceScaleFactor: 2,
    locale: 'en-US',
  });
  const pageTablet = await ctxTablet.newPage();
  await cb(pageTablet);
  await sleep(1000);
  await pageTablet.screenshot({
    path: resolve(OUT, `${id}-${label}-tablet.png`),
    fullPage: true,
  });
  console.log(`  ✓ ${label} tablet`);
  await ctxTablet.close();

  // Desktop RTL (Arabic)
  const ctxRtl = await browser.newContext({
    viewport: VIEWPORTS.desktop,
    deviceScaleFactor: 2,
    locale: 'ar-SA',
  });
  const pageRtl = await ctxRtl.newPage();
  // Navigate to the locale change or set dir via localStorage
  await cb(pageRtl);
  // Try to switch to Arabic via locale toggle
  // Store the current path
  const currentPath = pageRtl.url();
  // Try setting Arabic locale
  await pageRtl.evaluate(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  });
  // Reload with Arabic locale
  await pageRtl.goto(currentPath.replace('http://localhost:3000', 'http://localhost:3000/ar'), {
    waitUntil: 'networkidle',
    timeout: 30000,
  }).catch(async () => {
    // Fallback: try the same URL but with locale switch
    await pageRtl.goto(currentPath, { waitUntil: 'networkidle', timeout: 30000 });
    await pageRtl.evaluate(() => {
      // Try to find a locale switcher
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    });
    await sleep(1000);
  });
  await sleep(1500);
  await pageRtl.screenshot({
    path: resolve(OUT, `${id}-${label}-rtl.png`),
    fullPage: true,
  });
  console.log(`  ✓ ${label} RTL`);
  await ctxRtl.close();
}

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);

  // Fill login form
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await sleep(3000);
  console.log('  Logged in as:', CREDENTIALS.email);
}

async function findEntityIds(page, entity) {
  const urls = {
    trip: `${BASE}/trips`,
    driver: `${BASE}/drivers`,
    vehicle: `${BASE}/vehicles`,
  };
  const pattern = {
    trip: /^\/trips\/([a-f0-9-]+)$/,
    driver: /^\/drivers\/([a-f0-9-]+)$/,
    vehicle: /^\/vehicles\/([a-f0-9-]+)$/,
  };

  await page.goto(urls[entity], { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(3000);

  // Extract IDs from links
  const ids = await page.evaluate((p) => {
    const links = Array.from(document.querySelectorAll('a'));
    return links
      .map(a => a.getAttribute('href'))
      .filter(h => h && p.test(h))
      .map(h => h.match(p)[1]);
  }, pattern[entity]);

  console.log(`  Found ${entity} IDs:`, ids.slice(0, 3));
  return ids;
}

try {
  // Step 1: Login to get session
  console.log('=== Logging in ===');
  const loginCtx = await browser.newContext({
    viewport: VIEWPORTS.desktop,
    deviceScaleFactor: 2,
  });
  const loginPage = await loginCtx.newPage();
  await login(loginPage);

  // Step 2: Find entity IDs
  console.log('\n=== Finding entity IDs ===');
  const ids = {};
  for (const entity of PAGES) {
    ids[entity] = await findEntityIds(loginPage, entity);
  }
  loginCtx.close();

  console.log('\n=== IDs for capture ===');
  console.log(JSON.stringify(ids, null, 2));

  // Step 3: Capture screenshots for each entity
  for (const entity of PAGES) {
    const entityIds = ids[entity];
    if (!entityIds || entityIds.length === 0) {
      console.log(`\n⚠ No ${entity} IDs found, skipping ${entity}`);
      continue;
    }
    const entityId = entityIds[0];
    const detailUrl = `${BASE}/${entity}s/${entityId}`;

    await capture(entity, `${entity}-details`, async (page) => {
      await page.goto(detailUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(3000);
    });
  }

  console.log('\n=== All screenshots captured ===');
} catch (err) {
  console.error('Error:', err);
} finally {
  await browser.close();
}

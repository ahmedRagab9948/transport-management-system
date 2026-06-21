import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
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

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const browser = await chromium.launch({ headless: true });

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);
  await page.fill('input[type="email"]', CREDENTIALS.email);
  await page.fill('input[type="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await sleep(3000);
  console.log('  Logged in');
}

async function findEntityIds(page, entity) {
  const entityPlural = entity + 's';
  const url = `${BASE}/${entityPlural}`;
  
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(5000);

  // Debug: get page content
  const title = await page.title();
  const currentUrl = page.url();
  console.log(`  ${entity} page: ${currentUrl} (title: ${title})`);

  // Try multiple ways to get entity IDs
  const ids = await page.evaluate((ep) => {
    // Method 1: Look for links with the entity pattern
    const links = Array.from(document.querySelectorAll('a'));
    const hrefIds = links
      .map(a => a.getAttribute('href'))
      .filter(h => {
        if (!h) return false;
        const regex = new RegExp(`^/${ep}/([a-f0-9-]+)$`);
        return regex.test(h);
      })
      .map(h => h.match(new RegExp(`^/${ep}/([a-f0-9-]+)$`))[1]);
    
    if (hrefIds.length > 0) return { method: 'href', ids: hrefIds };

    // Method 2: Look for data-* attributes on rows
    const rows = Array.from(document.querySelectorAll('tr, [data-row-id], [data-id]'));
    const dataIds = rows
      .map(r => r.getAttribute('data-id') || r.getAttribute('data-row-id'))
      .filter(Boolean);
    if (dataIds.length > 0) return { method: 'data-id', ids: dataIds };

    // Method 3: Look at the HTML for any UUID-like patterns
    const body = document.body?.innerHTML || '';
    const uuidMatches = body.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g);
    if (uuidMatches) return { method: 'uuid-regex', ids: [...new Set(uuidMatches)] };

    return { method: 'none', ids: [] };
  }, entityPlural);

  console.log(`  Found IDs (${ids.method}):`, ids.ids.slice(0, 5));
  
  // Debug: take a screenshot of the empty list page
  if (ids.ids.length === 0) {
    await page.screenshot({ path: resolve(OUT, `debug-${entity}-list.png`), fullPage: true });
    console.log(`  → Debug screenshot saved`);
  }

  return ids.ids;
}

try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: 'en-US',
  });
  const page = await ctx.newPage();

  console.log('=== Logging in ===');
  await login(page);

  console.log('\n=== Finding entity IDs ===');
  const ids = {};
  for (const entity of ['trip', 'driver', 'vehicle']) {
    ids[entity] = await findEntityIds(page, entity);
  }

  console.log('\n=== IDs ===');
  console.log(JSON.stringify(ids, null, 2));

  if (ids.driver.length > 0 || ids.vehicle.length > 0) {
    console.log('\n=== Taking screenshots ===');
    
    for (const entity of ['driver', 'vehicle']) {
      const entityId = ids[entity]?.[0];
      if (!entityId) continue;
      
      const entityPlural = entity + 's';
      const detailUrl = `${BASE}/${entityPlural}/${entityId}`;
      console.log(`\n  ${entity}: ${detailUrl}`);

      // Desktop
      await page.goto(detailUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(3000);
      await page.screenshot({
        path: resolve(OUT, `${entity}-details-desktop.png`),
        fullPage: true,
      });
      console.log(`  ✓ Desktop saved`);
    }
  }

  await ctx.close();
  console.log('\nDone');
} catch (err) {
  console.error('Error:', err);
} finally {
  await browser.close();
}

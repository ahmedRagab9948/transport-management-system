import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = 'screenshots';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  locale: 'en-US',
  deviceScaleFactor: 2,
});

const page = await context.newPage();

// 1. Navigate to trips list and extract first trip ID
console.log('=== Navigating to trips list ===');
await page.goto(`${BASE}/trips`, { waitUntil: 'networkidle', timeout: 30000 });
console.log('Trips URL:', page.url());
await page.waitForTimeout(2000);

// Try to get the first trip ID from the page
const tripIds = await page.evaluate(() => {
  // Check for links that match /trips/[id] pattern (but not /trips/[id]/edit)
  const links = Array.from(document.querySelectorAll('a[href*="/trips/"]'));
  return links
    .map(a => a.getAttribute('href'))
    .filter(h => h && /^\/trips\/[a-f0-9-]+$/.test(h))
    .map(h => h.replace('/trips/', ''));
});
console.log('Found trip IDs:', tripIds);

// Try clicking on a row with a link
let tripId = tripIds?.[0];
if (!tripId) {
  // Try clicking first row in the table
  const firstRow = await page.$('tbody tr a, tbody tr button[data-action="view"]');
  if (firstRow) {
    const href = await firstRow.getAttribute('href');
    if (href) tripId = href.replace('/trips/', '');
    console.log('Found trip ID from first row:', tripId);
  }
}

// If still no ID, try the drivers page
console.log('\n=== Navigating to drivers list ===');
await page.goto(`${BASE}/drivers`, { waitUntil: 'networkidle', timeout: 30000 });
console.log('Drivers URL:', page.url());
await page.waitForTimeout(2000);

const driverIds = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href*="/drivers/"]'));
  return links
    .map(a => a.getAttribute('href'))
    .filter(h => h && /^\/drivers\/[a-f0-9-]+$/.test(h))
    .map(h => h.replace('/drivers/', ''));
});
console.log('Found driver IDs:', driverIds);

let driverId = driverIds?.[0];
if (!driverId) {
  const firstRow = await page.$('tbody tr a, tbody tr button[data-action="view"]');
  if (firstRow) {
    const href = await firstRow.getAttribute('href');
    if (href) driverId = href.replace('/drivers/', '');
    console.log('Found driver ID from first row:', driverId);
  }
}

// Vehicles
console.log('\n=== Navigating to vehicles list ===');
await page.goto(`${BASE}/vehicles`, { waitUntil: 'networkidle', timeout: 30000 });
console.log('Vehicles URL:', page.url());
await page.waitForTimeout(2000);

const vehicleIds = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href*="/vehicles/"]'));
  return links
    .map(a => a.getAttribute('href'))
    .filter(h => h && /^\/vehicles\/[a-f0-9-]+$/.test(h))
    .map(h => h.replace('/vehicles/', ''));
});
console.log('Found vehicle IDs:', vehicleIds);

let vehicleId = vehicleIds?.[0];
if (!vehicleId) {
  const firstRow = await page.$('tbody tr a, tbody tr button[data-action="view"]');
  if (firstRow) {
    const href = await firstRow.getAttribute('href');
    if (href) vehicleId = href.replace('/vehicles/', '');
    console.log('Found vehicle ID from first row:', vehicleId);
  }
}

console.log('\n=== IDs found ===');
console.log('Trip ID:', tripId);
console.log('Driver ID:', driverId);
console.log('Vehicle ID:', vehicleId);

// Save IDs for screenshot script
const ids = { tripId, driverId, vehicleId };
writeFileSync(`${OUT}/ids.json`, JSON.stringify(ids, null, 2));
console.log('IDs saved to screenshots/ids.json');

await browser.close();

/* Captura reproducible: Playwright + Chrome local, viewport CSS exacto y movimiento desactivado. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'capturas');
const baseURL = process.env.BASELINE_URL || 'http://127.0.0.1:4173';
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const targets = [
  ['inicio-1440x900-full.png', 'index.html', 1440, 900],
  ['inicio-900x900-full.png', 'index.html', 900, 900],
  ['inicio-390x844-full.png', 'index.html', 390, 844],
  ['servicios-1440x900-full.png', 'servicios.html', 1440, 900],
  ['servicios-390x844-full.png', 'servicios.html', 390, 844],
  ['visitanos-1440x900-full.png', 'visitanos.html', 1440, 900],
  ['visitanos-390x844-full.png', 'visitanos.html', 390, 844],
];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: chrome, headless: true });
  for (const [name, pagePath, width, height] of targets) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce', locale: 'es-SV', timezoneId: 'America/El_Salvador' });
    const page = await context.newPage();
    await page.goto(`${baseURL}/${pagePath}`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible')));
    await page.screenshot({ path: path.join(out, name), fullPage: true, animations: 'disabled' });
    await context.close();
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });

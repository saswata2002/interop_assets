// Renders frames from the code version headless and diffs them against PNGs
// AE rendered of the Sequence comp (CompItem.saveFrameToPng).
//   node tools/compare.mjs <ae-frames-dir> <out-dir> [url]
// Frames are named fNNN.png. Needs puppeteer-core + Google Chrome.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER || 'puppeteer-core');
const [refDir, outDir, url = 'http://localhost:8323/'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 });
page.on('console', m => console.log('page:', m.text()));
page.on('pageerror', e => console.log('pageerror:', e.message));
await page.goto(url, { waitUntil: 'networkidle0' });
await page.waitForFunction('window.__renderFrame');
for (const f of fs.readdirSync(refDir).filter(n => /^f\d+\.png$/.test(n)).sort()) {
  const n = +f.slice(1, 4);
  const data = await page.evaluate(n => window.__renderFrame(n), n);
  fs.writeFileSync(path.join(outDir, f), Buffer.from(data.split(',')[1], 'base64'));
}
await browser.close();

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = process.cwd();
const cvHtml = path.join(root, 'public', 'cv', 'index.html');
const publicPdf = path.join(
  root,
  'public',
  'cv',
  'CV-Daniel-Garcia-Ortega.pdf',
);

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto(pathToFileURL(cvHtml).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: publicPdf,
    printBackground: true,
    preferCSSPageSize: true,
  });
  console.log(`CV exportado en ${publicPdf}`);
} finally {
  await browser.close();
}

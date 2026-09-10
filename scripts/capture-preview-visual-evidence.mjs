#!/usr/bin/env node
// @ts-check

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import {
  PREVIEW_VISUAL_SURFACES,
  PREVIEW_VISUAL_VIEWPORTS,
  buildPreviewRequestHeaders,
  createVisualEvidenceManifest,
  parseValidatedPreviewUrl,
  validateHeadSha,
} from './lib/preview-visual-evidence.mjs';

/** @param {string} name */
function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable ${name}.`);
  return value;
}

/** @param {import('@playwright/test').Page} page */
async function waitForMobileMenuToSettle(page) {
  await page.waitForFunction(
    () => {
      const menu = document.querySelector('[data-mobile-menu]');
      if (!(menu instanceof HTMLDialogElement) || !menu.open) return false;

      const styles = getComputedStyle(menu);
      return (
        styles.opacity === '1' &&
        (styles.transform === 'none' ||
          styles.transform === 'matrix(1, 0, 0, 1, 0, 0)')
      );
    },
    undefined,
    { timeout: 5_000 },
  );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ locale: string, path: string, menuButtonName: string }} surface
 * @param {{ name: string, width: number, height: number }} viewport
 * @param {string} outputDirectory
 * @param {URL} previewUrl
 */
async function captureSurface(
  page,
  surface,
  viewport,
  outputDirectory,
  previewUrl,
) {
  const targetUrl = new URL(surface.path.replace(/^\//, ''), previewUrl);
  const response = await page.goto(targetUrl.href, {
    waitUntil: 'networkidle',
    timeout: 45_000,
  });

  if (!response || !response.ok()) {
    throw new Error(
      `Visual evidence navigation failed for ${targetUrl.href}: ${response?.status() ?? 'no response'}.`,
    );
  }

  if (new URL(page.url()).origin !== previewUrl.origin) {
    throw new Error(
      `Visual evidence navigation left the validated Preview origin: ${page.url()}.`,
    );
  }

  const documentLocale = await page.locator('html').getAttribute('lang');
  if (documentLocale !== surface.locale) {
    throw new Error(
      `Expected html[lang=${surface.locale}] at ${targetUrl.href}, received ${documentLocale ?? 'missing'}.`,
    );
  }

  const viewportDirectory = path.join(outputDirectory, viewport.name);
  await mkdir(viewportDirectory, { recursive: true });

  const homeFile = `${surface.locale}-home.png`;
  await page.screenshot({
    path: path.join(viewportDirectory, homeFile),
    fullPage: true,
  });

  const captures = [
    {
      locale: surface.locale,
      route: surface.path,
      viewport: viewport.name,
      state: 'home',
      file: `${viewport.name}/${homeFile}`,
    },
  ];

  if (viewport.width <= 900) {
    await page.getByRole('button', { name: surface.menuButtonName }).click();
    await waitForMobileMenuToSettle(page);

    const menuFile = `${surface.locale}-menu.png`;
    await page.screenshot({ path: path.join(viewportDirectory, menuFile) });
    captures.push({
      locale: surface.locale,
      route: surface.path,
      viewport: viewport.name,
      state: 'mobile-menu',
      file: `${viewport.name}/${menuFile}`,
    });
  }

  return captures;
}

async function main() {
  const previewUrl = parseValidatedPreviewUrl(
    requireEnvironment('PREVIEW_URL'),
  );
  const headSha = validateHeadSha(requireEnvironment('EXPECTED_HEAD_SHA'));
  const protectionBypassSecret = requireEnvironment(
    'VERCEL_AUTOMATION_BYPASS_SECRET',
  );
  const outputDirectory = path.resolve(
    process.env.PREVIEW_VISUAL_OUTPUT_DIR?.trim() ||
      path.join('artifacts', 'preview-visual-evidence'),
  );

  await mkdir(outputDirectory, { recursive: true });

  const browser = await chromium.launch();
  const captures = [];

  try {
    for (const viewport of PREVIEW_VISUAL_VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'reduce',
      });

      await context.route('**/*', async (route) => {
        const request = route.request();
        const headers = buildPreviewRequestHeaders(
          request.url(),
          previewUrl,
          await request.allHeaders(),
          protectionBypassSecret,
        );
        await route.continue({ headers });
      });

      try {
        for (const surface of PREVIEW_VISUAL_SURFACES) {
          const page = await context.newPage();
          try {
            captures.push(
              ...(await captureSurface(
                page,
                surface,
                viewport,
                outputDirectory,
                previewUrl,
              )),
            );
          } finally {
            await page.close();
          }
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const manifest = createVisualEvidenceManifest({
    headSha,
    previewUrl,
    captures,
  });
  await writeFile(
    path.join(outputDirectory, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `Captured ${captures.length} exact-head Preview visual evidence files for ${headSha.slice(0, 12)}.`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Preview visual evidence capture failed: ${message}`);
  process.exitCode = 1;
});

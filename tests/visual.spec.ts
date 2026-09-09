import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const viewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

for (const viewport of viewports) {
  test(`capturas verificables en ${viewport.name}`, async ({ page }) => {
    const output = path.join(
      process.cwd(),
      'docs',
      'screenshots',
      viewport.name,
    );
    await mkdir(output, { recursive: true });
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('./');
    await page.screenshot({
      path: path.join(output, 'inicio.png'),
      fullPage: true,
    });

    await page.getByRole('button', { name: 'Ver proyecto AL-LÍO' }).click();
    await page.screenshot({ path: path.join(output, 'inicio-modal.png') });
    await page.keyboard.press('Escape');

    await page.goto('./proyectos/');
    await page.screenshot({
      path: path.join(output, 'proyectos.png'),
      fullPage: true,
    });

    await page.goto('./cv/');
    await page.screenshot({
      path: path.join(output, 'cv.png'),
      fullPage: true,
    });

    if (viewport.width <= 900) {
      await page.goto('./');
      await page.getByRole('button', { name: 'Abrir menú' }).click();
      await page.screenshot({ path: path.join(output, 'menu-movil.png') });
    }
  });
}

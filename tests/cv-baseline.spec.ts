import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const A4_WIDTH_PX = (210 / 25.4) * 96;
const A4_HEIGHT_PX = (297 / 25.4) * 96;
const A4_TOLERANCE_PX = 2;

async function readRepositoryFile(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('Spanish CV preserves its corrected semantic topology and factual ordering', async ({
  page,
}) => {
  const response = await page.goto('./cv/');
  expect(response?.ok()).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  const majorOrder = await page.locator('.cv-content').evaluate((content) =>
    Array.from(content.children)
      .map((element) =>
        ['projects-section', 'experience-section', 'stack-section', 'bottom-grid'].find(
          (className) => element.classList.contains(className),
        ),
      )
      .filter(Boolean),
  );
  expect(majorOrder).toEqual([
    'projects-section',
    'experience-section',
    'stack-section',
    'bottom-grid',
  ]);

  await expect(page.locator('.project-card h3')).toHaveText([
    'AL-LÍO',
    'SIDN Cost Control',
    'Feedback2Action',
  ]);
  await expect(page.locator('.experience-company h3')).toHaveText([
    'Salunox',
    'Konecta',
    'Alcampo',
  ]);

  await expect(page.locator('.stack-section')).toHaveCount(1);
  await expect(page.locator('.education-section')).toHaveCount(1);
  await expect(page.locator('.final-section')).toHaveCount(1);
  await expect(page.locator('.professional-footer')).toHaveCount(1);
});

test('Spanish CV keeps A4 geometry, print containment and footer placement', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('./cv/');

  const sheet = page.locator('.cv-sheet');
  const screenBox = await sheet.boundingBox();
  expect(screenBox).not.toBeNull();
  expect(Math.abs((screenBox?.width ?? 0) - A4_WIDTH_PX)).toBeLessThanOrEqual(
    A4_TOLERANCE_PX,
  );
  expect(Math.abs((screenBox?.height ?? 0) - A4_HEIGHT_PX)).toBeLessThanOrEqual(
    A4_TOLERANCE_PX,
  );

  const screenContainment = await page.evaluate(() => {
    const sheetElement = document.querySelector<HTMLElement>('.cv-sheet');
    const footer = document.querySelector<HTMLElement>('.professional-footer');
    if (!sheetElement || !footer) return null;

    const sheetRect = sheetElement.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    return {
      clientWidth: sheetElement.clientWidth,
      clientHeight: sheetElement.clientHeight,
      scrollWidth: sheetElement.scrollWidth,
      scrollHeight: sheetElement.scrollHeight,
      footerInside:
        footerRect.left >= sheetRect.left - 1 &&
        footerRect.right <= sheetRect.right + 1 &&
        footerRect.top >= sheetRect.top - 1 &&
        footerRect.bottom <= sheetRect.bottom + 1,
    };
  });
  expect(screenContainment).not.toBeNull();
  expect(screenContainment?.scrollWidth).toBeLessThanOrEqual(
    (screenContainment?.clientWidth ?? 0) + 1,
  );
  expect(screenContainment?.scrollHeight).toBeLessThanOrEqual(
    (screenContainment?.clientHeight ?? 0) + 1,
  );
  expect(screenContainment?.footerInside).toBe(true);

  await page.emulateMedia({ media: 'print' });
  const printBox = await sheet.boundingBox();
  expect(printBox).not.toBeNull();
  expect(Math.abs((printBox?.width ?? 0) - A4_WIDTH_PX)).toBeLessThanOrEqual(
    A4_TOLERANCE_PX,
  );
  expect(Math.abs((printBox?.height ?? 0) - A4_HEIGHT_PX)).toBeLessThanOrEqual(
    A4_TOLERANCE_PX,
  );
  await expect(page.locator('.download-btn')).toHaveCSS('display', 'none');
  await expect(page.locator('.portfolio-back-link')).toHaveCSS('display', 'none');
});

test('Spanish CV remains fluid and one-column at the 390px mobile baseline', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./cv/');

  const geometry = await page.evaluate(() => {
    const sheet = document.querySelector<HTMLElement>('.cv-sheet');
    const footer = document.querySelector<HTMLElement>('.professional-footer');
    const selectors = [
      '.projects-grid',
      '.stack-grid',
      '.experience-item',
      '.bottom-grid',
    ];
    if (!sheet || !footer) return null;

    return {
      sheetWidth: sheet.getBoundingClientRect().width,
      sheetHeight: getComputedStyle(sheet).height,
      footerPosition: getComputedStyle(footer).position,
      columns: selectors.map((selector) => {
        const element = document.querySelector<HTMLElement>(selector);
        return element ? getComputedStyle(element).gridTemplateColumns : '';
      }),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry?.sheetWidth).toBeLessThanOrEqual(391);
  expect(geometry?.sheetHeight).not.toBe(`${A4_HEIGHT_PX}px`);
  expect(geometry?.footerPosition).toBe('static');
  for (const columns of geometry?.columns ?? []) {
    expect(columns.trim().split(/\s+/)).toHaveLength(1);
  }
  expect(geometry?.scrollWidth).toBeLessThanOrEqual(geometry?.clientWidth ?? 0);

  await expect(page.locator('.download-btn')).toBeVisible();
  await expect(page.locator('.portfolio-back-link')).toBeVisible();
});

test('Spanish CV passes its own axe accessibility gate', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./cv/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('Spanish CV exporter and stylesheet keep the frozen source contract', async () => {
  const exporter = await readRepositoryFile('scripts/export-cv.mjs');
  const styles = await readRepositoryFile('public/cv/styles.css');

  expect(exporter).toContain("path.join(root, 'public', 'cv', 'index.html')");
  expect(exporter).toContain("'CV-Daniel-Garcia-Ortega.pdf'");
  expect(exporter).toContain('printBackground: true');
  expect(exporter).toContain('preferCSSPageSize: true');
  expect(exporter).toContain('document.fonts.ready');
  expect(exporter).toMatch(/finally\s*\{/);
  expect(exporter).toContain('await browser.close()');

  expect(styles).toMatch(/\.cv-sheet\s*\{[\s\S]*?width:\s*210mm;[\s\S]*?height:\s*297mm;/);
  expect(styles).toMatch(/@page\s*\{[\s\S]*?size:\s*A4;[\s\S]*?margin:\s*0;/);
  expect(styles).toMatch(/@media print\s*\{[\s\S]*?\.download-btn,[\s\S]*?\.portfolio-back-link\s*\{[\s\S]*?display:\s*none\s*!important;/);
  expect(styles).toMatch(/@media screen and \(max-width:\s*700px\)[\s\S]*?\.cv-sheet\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*auto;/);
  expect(styles).toMatch(/@media screen and \(max-width:\s*700px\)[\s\S]*?\.professional-footer\s*\{[\s\S]*?position:\s*static;/);
});

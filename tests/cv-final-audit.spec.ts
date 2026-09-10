import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const A4_WIDTH_PX = (210 / 25.4) * 96;
const A4_HEIGHT_PX = (297 / 25.4) * 96;
const A4_TOLERANCE_PX = 2;

const localeCases = [
  {
    locale: 'es',
    route: './cv/',
    counterpartHref: '../en/cv/',
    counterpartLabel: 'Ver CV en inglés',
    backLabel: 'Volver al portfolio de Daniel García Ortega',
    downloadLabel: 'Descargar CV de Daniel García Ortega en PDF',
    downloadHref: 'CV-Daniel-Garcia-Ortega.pdf',
  },
  {
    locale: 'en',
    route: './en/cv/',
    counterpartHref: '../../cv/',
    counterpartLabel: 'View CV in Spanish',
    backLabel: 'Back to Daniel García Ortega portfolio',
    downloadLabel: 'Download Daniel García Ortega CV as PDF',
    downloadHref: 'CV-Daniel-Garcia-Ortega-EN.pdf',
  },
] as const;

for (const localeCase of localeCases) {
  test(`${localeCase.locale} final CV keeps A4 containment, accessibility and one-target navigation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1200 });
    const response = await page.goto(localeCase.route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      localeCase.locale,
    );

    const counterpart = page.getByRole('link', {
      name: localeCase.counterpartLabel,
    });
    const back = page.getByRole('link', { name: localeCase.backLabel });
    const download = page.getByRole('link', {
      name: localeCase.downloadLabel,
    });

    await expect(page.locator('[data-locale-link]')).toHaveCount(1);
    await expect(counterpart).toHaveAttribute(
      'href',
      localeCase.counterpartHref,
    );
    await expect(back).toHaveAttribute('href', '../');
    await expect(download).toHaveAttribute('href', localeCase.downloadHref);
    await expect(page.locator('.download-btn')).toHaveCount(1);

    const sheet = page.locator('.cv-sheet');
    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs((box?.width ?? 0) - A4_WIDTH_PX)).toBeLessThanOrEqual(
      A4_TOLERANCE_PX,
    );
    expect(Math.abs((box?.height ?? 0) - A4_HEIGHT_PX)).toBeLessThanOrEqual(
      A4_TOLERANCE_PX,
    );

    const containment = await page.evaluate(() => {
      const sheetElement = document.querySelector<HTMLElement>('.cv-sheet');
      const footer = document.querySelector<HTMLElement>(
        '.professional-footer',
      );
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

    expect(containment).not.toBeNull();
    expect(containment?.scrollWidth).toBeLessThanOrEqual(
      (containment?.clientWidth ?? 0) + 1,
    );
    expect(containment?.scrollHeight).toBeLessThanOrEqual(
      (containment?.clientHeight ?? 0) + 1,
    );
    expect(containment?.footerInside).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.portfolio-back-link')).toHaveCSS(
      'display',
      'none',
    );
    await expect(page.locator('.download-btn')).toHaveCSS('display', 'none');
    await expect(page.locator('.cv-locale-link')).toHaveCSS('display', 'none');
  });

  test(`${localeCase.locale} final CV stays fluid at the 390px mobile baseline`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(localeCase.route);
    expect(response?.ok()).toBe(true);

    const geometry = await page.evaluate(() => {
      const sheet = document.querySelector<HTMLElement>('.cv-sheet');
      const footer = document.querySelector<HTMLElement>(
        '.professional-footer',
      );
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
    expect(geometry?.scrollWidth).toBeLessThanOrEqual(
      geometry?.clientWidth ?? 0,
    );

    await expect(page.locator('.portfolio-back-link')).toBeVisible();
    await expect(page.locator('.download-btn')).toBeVisible();
    await expect(page.locator('.cv-locale-link')).toBeVisible();
  });
}

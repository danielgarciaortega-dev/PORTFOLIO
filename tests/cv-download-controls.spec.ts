import { expect, test } from '@playwright/test';

const localeCases = [
  {
    locale: 'es',
    route: './cv/',
    downloadLabel: 'Descargar CV de Daniel García Ortega en PDF',
  },
  {
    locale: 'en',
    route: './en/cv/',
    downloadLabel: 'Download Daniel García Ortega CV as PDF',
  },
] as const;

for (const localeCase of localeCases) {
  test(`${localeCase.locale} CV keeps download in the desktop top-right utility cluster`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(localeCase.route);

    const geometry = await page.evaluate((downloadLabel) => {
      const nav = document.querySelector<HTMLElement>('.cv-page-landmark');
      const actions = document.querySelector<HTMLElement>('.cv-page-actions');
      const locale = document.querySelector<HTMLElement>('.cv-locale-link');
      const download = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('.download-btn'),
      ).find((node) => node.getAttribute('aria-label') === downloadLabel);

      if (!nav || !actions || !locale || !download) return null;

      const actionsRect = actions.getBoundingClientRect();
      const localeRect = locale.getBoundingClientRect();
      const downloadRect = download.getBoundingClientRect();

      return {
        navDisplay: getComputedStyle(nav).display,
        actionsPosition: getComputedStyle(actions).position,
        downloadPosition: getComputedStyle(download).position,
        actionsTop: actionsRect.top,
        actionsRight: window.innerWidth - actionsRect.right,
        localeLeft: localeRect.left,
        downloadLeft: downloadRect.left,
        downloadBottom: downloadRect.bottom,
      };
    }, localeCase.downloadLabel);

    expect(geometry).not.toBeNull();
    expect(geometry?.navDisplay).toBe('contents');
    expect(geometry?.actionsPosition).toBe('fixed');
    expect(geometry?.downloadPosition).toBe('static');
    expect(geometry?.actionsTop).toBeGreaterThanOrEqual(20);
    expect(geometry?.actionsTop).toBeLessThanOrEqual(28);
    expect(geometry?.actionsRight).toBeGreaterThanOrEqual(20);
    expect(geometry?.actionsRight).toBeLessThanOrEqual(28);
    expect(geometry?.downloadLeft ?? 0).toBeGreaterThan(
      geometry?.localeLeft ?? Number.MAX_SAFE_INTEGER,
    );
    expect(geometry?.downloadBottom).toBeLessThan(90);
  });

  for (const width of [360, 390, 430]) {
    test(`${localeCase.locale} CV top controls fit at ${width}px without covering document content`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(localeCase.route);

      const geometry = await page.evaluate((downloadLabel) => {
        const nav = document.querySelector<HTMLElement>('.cv-page-landmark');
        const actions = document.querySelector<HTMLElement>('.cv-page-actions');
        const back = document.querySelector<HTMLElement>(
          '.portfolio-back-link',
        );
        const locale = document.querySelector<HTMLElement>('.cv-locale-link');
        const download = Array.from(
          document.querySelectorAll<HTMLAnchorElement>('.download-btn'),
        ).find((node) => node.getAttribute('aria-label') === downloadLabel);
        const label = download?.querySelector<HTMLElement>(
          '.download-btn__label',
        );
        const sheet = document.querySelector<HTMLElement>('.cv-sheet');

        if (!nav || !actions || !back || !locale || !download || !label || !sheet) {
          return null;
        }

        const navRect = nav.getBoundingClientRect();
        const backRect = back.getBoundingClientRect();
        const actionsRect = actions.getBoundingClientRect();
        const downloadRect = download.getBoundingClientRect();
        const sheetRect = sheet.getBoundingClientRect();

        return {
          navDisplay: getComputedStyle(nav).display,
          actionsPosition: getComputedStyle(actions).position,
          downloadPosition: getComputedStyle(download).position,
          downloadLabelDisplay: getComputedStyle(label).display,
          downloadWidth: downloadRect.width,
          downloadHeight: downloadRect.height,
          backRight: backRect.right,
          actionsLeft: actionsRect.left,
          navBottom: navRect.bottom,
          sheetTop: sheetRect.top,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      }, localeCase.downloadLabel);

      expect(geometry).not.toBeNull();
      expect(geometry?.navDisplay).toBe('flex');
      expect(geometry?.actionsPosition).toBe('static');
      expect(geometry?.downloadPosition).toBe('static');
      expect(geometry?.downloadLabelDisplay).toBe('none');
      expect(geometry?.downloadWidth).toBeGreaterThanOrEqual(43);
      expect(geometry?.downloadWidth).toBeLessThanOrEqual(45);
      expect(geometry?.downloadHeight).toBeGreaterThanOrEqual(43);
      expect(geometry?.downloadHeight).toBeLessThanOrEqual(45);
      expect(geometry?.backRight ?? Number.MAX_SAFE_INTEGER).toBeLessThanOrEqual(
        geometry?.actionsLeft ?? 0,
      );
      expect(geometry?.navBottom ?? Number.MAX_SAFE_INTEGER).toBeLessThanOrEqual(
        (geometry?.sheetTop ?? 0) + 1,
      );
      expect(geometry?.scrollWidth).toBeLessThanOrEqual(
        geometry?.clientWidth ?? 0,
      );
    });
  }
}

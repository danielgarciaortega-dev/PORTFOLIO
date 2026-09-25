import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const cases = [
  {
    route: './cv/opciones/',
    locale: 'es',
    title: 'Currículum · Daniel García Ortega',
    counterpartName: 'Cambiar a inglés',
    counterpartHref: '/PORTFOLIO/en/cv/options/',
    heading: 'Elige formato e idioma',
    designedGroup: 'CV VISUAL',
    atsGroup: 'CV ATS',
  },
  {
    route: './en/cv/options/',
    locale: 'en',
    title: 'CV · Daniel García Ortega',
    counterpartName: 'Switch to Spanish',
    counterpartHref: '/PORTFOLIO/cv/opciones/',
    heading: 'Choose format and language',
    designedGroup: 'DESIGNED CV',
    atsGroup: 'ATS CV',
  },
] as const;

const expectedOptions = [
  {
    variant: 'designed',
    locale: 'es',
    href: '/PORTFOLIO/cv/',
  },
  {
    variant: 'designed',
    locale: 'en',
    href: '/PORTFOLIO/en/cv/',
  },
  {
    variant: 'ats',
    locale: 'es',
    href: '/PORTFOLIO/cv/ats/',
  },
  {
    variant: 'ats',
    locale: 'en',
    href: '/PORTFOLIO/en/cv/ats/',
  },
] as const;

for (const routeCase of cases) {
  test(`CV center route ${routeCase.locale} exposes the four approved destinations`, async ({
    page,
  }) => {
    const response = await page.goto(routeCase.route);
    expect(response?.ok()).toBe(true);

    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      routeCase.locale,
    );
    await expect(page).toHaveTitle(routeCase.title);
    await expect(page.locator('[data-cv-center]')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 1, name: routeCase.heading }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: routeCase.designedGroup }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: routeCase.atsGroup }),
    ).toBeVisible();
    await expect(page.locator('[data-cv-format]')).toHaveCount(2);
    await expect(page.locator('.cv-center__intro > p:not(.eyebrow)')).toHaveCount(0);
    await expect(page.locator('.cv-center__format-description')).toHaveCount(0);
    await expect(page.locator('[data-cv-format="designed"]')).toHaveCount(1);
    await expect(page.locator('[data-cv-format="ats"]')).toHaveCount(1);
    await expect(page.locator('[data-cv-option]')).toHaveCount(4);
    await expect(page.locator('[data-cv-option] small')).toHaveCount(4);
    await expect(
      page.locator('[data-cv-format="designed"] [data-cv-option]'),
    ).toHaveCount(2);
    await expect(
      page.locator('[data-cv-format="ats"] [data-cv-option]'),
    ).toHaveCount(2);
    await expect(page.locator('.cv-center__option')).toHaveCount(0);

    for (const option of expectedOptions) {
      const link = page.locator(
        `[data-cv-option][data-cv-variant="${option.variant}"][data-cv-locale="${option.locale}"]`,
      );
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', option.href);
    }

    const counterpart = page
      .locator('.site-header__actions')
      .getByRole('link', { name: routeCase.counterpartName });
    await expect(counterpart).toHaveAttribute(
      'href',
      routeCase.counterpartHref,
    );

    const firstOption = page.locator('[data-cv-option]').first();
    await firstOption.focus();
    await expect(firstOption).toBeFocused();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('CV center hero stays on one line at representative widths', async ({
  page,
}) => {
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });

    for (const routeCase of cases) {
      await page.goto(routeCase.route);
      const heading = page.getByRole('heading', {
        level: 1,
        name: routeCase.heading,
      });

      const geometry = await heading.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          whiteSpace: style.whiteSpace,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          height: element.getBoundingClientRect().height,
          lineHeight: Number.parseFloat(style.lineHeight),
        };
      });

      expect(geometry.whiteSpace).toBe('nowrap');
      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
      expect(geometry.height).toBeLessThanOrEqual(geometry.lineHeight * 1.1);
    }
  }
});

for (const width of [360, 390, 430]) {
  test(`CV center stays overflow-free at ${width}px in both locales`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });

    for (const routeCase of cases) {
      await page.goto(routeCase.route);
      await expect(page.locator('[data-cv-option]')).toHaveCount(4);

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
}

test('existing designed CV routes remain direct viewers', async ({ page }) => {
  for (const route of ['./cv/', './en/cv/']) {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('.cv-sheet')).toHaveCount(1);
    await expect(page.locator('[data-cv-center]')).toHaveCount(0);
  }
});

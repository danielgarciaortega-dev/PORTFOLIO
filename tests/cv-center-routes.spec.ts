import { expect, test } from '@playwright/test';

const cases = [
  {
    route: './cv/opciones/',
    locale: 'es',
    title: 'Currículum · Daniel García Ortega',
    counterpartName: 'Cambiar a inglés',
    counterpartHref: '/PORTFOLIO/en/cv/options/',
  },
  {
    route: './en/cv/options/',
    locale: 'en',
    title: 'CV · Daniel García Ortega',
    counterpartName: 'Switch to Spanish',
    counterpartHref: '/PORTFOLIO/cv/opciones/',
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
    await expect(page.locator('[data-cv-option]')).toHaveCount(4);

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

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
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

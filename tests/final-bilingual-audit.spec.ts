import { expect, test, type Page } from '@playwright/test';

interface RouteSide {
  route: string;
  locale: 'es' | 'en';
  pathname: string;
}

interface CounterpartPair {
  name: string;
  es: RouteSide;
  en: RouteSide;
  selector: string;
}

const counterpartPairs: CounterpartPair[] = [
  {
    name: 'home',
    es: { route: './', locale: 'es', pathname: '/PORTFOLIO/' },
    en: { route: './en/', locale: 'en', pathname: '/PORTFOLIO/en/' },
    selector: '.site-header__actions [data-language-switcher] a',
  },
  {
    name: 'projects',
    es: {
      route: './proyectos/',
      locale: 'es',
      pathname: '/PORTFOLIO/proyectos/',
    },
    en: {
      route: './en/projects/',
      locale: 'en',
      pathname: '/PORTFOLIO/en/projects/',
    },
    selector: '.site-header__actions [data-language-switcher] a',
  },
  {
    name: 'CV',
    es: { route: './cv/', locale: 'es', pathname: '/PORTFOLIO/cv/' },
    en: {
      route: './en/cv/',
      locale: 'en',
      pathname: '/PORTFOLIO/en/cv/',
    },
    selector: '[data-locale-link]',
  },
];

async function expectCanonicalRoute(page: Page, side: RouteSide) {
  const response = await page.goto(side.route);
  expect(response?.status(), side.pathname).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', side.locale);
  expect(new URL(page.url()).pathname).toBe(side.pathname);
}

async function counterpartPathname(page: Page, selector: string) {
  const href = await page.locator(selector).getAttribute('href');
  expect(href).not.toBeNull();
  return new URL(href!, page.url()).pathname;
}

test('all three canonical ES/EN route pairs form one deterministic counterpart system', async ({
  page,
}) => {
  for (const pair of counterpartPairs) {
    await expectCanonicalRoute(page, pair.es);
    await expect(
      page.locator(pair.selector),
      `${pair.name} ES counterpart`,
    ).toHaveCount(1);
    expect(await counterpartPathname(page, pair.selector)).toBe(
      pair.en.pathname,
    );

    await page.locator(pair.selector).click();
    await expect(page).toHaveURL(new RegExp(`${pair.en.pathname}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem('portfolio.locale')),
      )
      .toBe('en');

    await expect(
      page.locator(pair.selector),
      `${pair.name} EN counterpart`,
    ).toHaveCount(1);
    expect(await counterpartPathname(page, pair.selector)).toBe(
      pair.es.pathname,
    );

    await page.locator(pair.selector).click();
    await expect(page).toHaveURL(new RegExp(`${pair.es.pathname}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem('portfolio.locale')),
      )
      .toBe('es');
  }
});

test('curated public UI landmarks do not mix Spanish and English shell copy', async ({
  page,
}) => {
  for (const route of ['./', './proyectos/']) {
    await page.goto(route);
    const navigation = page.getByRole('navigation', {
      name: 'Navegación principal',
    });
    await expect(
      navigation.getByText('Inicio', { exact: true }),
    ).toBeVisible();
    await expect(
      navigation.getByText('Sobre mí', { exact: true }),
    ).toBeVisible();
    await expect(
      navigation.getByText('Proyectos', { exact: true }),
    ).toBeVisible();
    await expect(navigation.getByText('Home', { exact: true })).toHaveCount(0);
    await expect(navigation.getByText('About', { exact: true })).toHaveCount(0);
    await expect(
      navigation.getByText('Projects', { exact: true }),
    ).toHaveCount(0);
  }

  for (const route of ['./en/', './en/projects/']) {
    await page.goto(route);
    const navigation = page.getByRole('navigation', {
      name: 'Main navigation',
    });
    await expect(navigation.getByText('Home', { exact: true })).toBeVisible();
    await expect(navigation.getByText('About', { exact: true })).toBeVisible();
    await expect(
      navigation.getByText('Projects', { exact: true }),
    ).toBeVisible();
    await expect(navigation.getByText('Inicio', { exact: true })).toHaveCount(0);
    await expect(
      navigation.getByText('Sobre mí', { exact: true }),
    ).toHaveCount(0);
    await expect(
      navigation.getByText('Proyectos', { exact: true }),
    ).toHaveCount(0);
  }

  await page.goto('./cv/');
  await expect(page.locator('.portfolio-back-link')).toContainText(
    'Volver al portfolio',
  );
  await expect(page.locator('.role')).toHaveText(
    'DESARROLLADOR WEB FULL-STACK',
  );
  await expect(
    page.getByText('Back to portfolio', { exact: true }),
  ).toHaveCount(0);

  await page.goto('./en/cv/');
  await expect(page.locator('.portfolio-back-link')).toContainText(
    'Back to portfolio',
  );
  await expect(page.locator('.role')).toHaveText('FULL-STACK WEB DEVELOPER');
  await expect(
    page.getByText('Volver al portfolio', { exact: true }),
  ).toHaveCount(0);
});

test('every canonical bilingual route stays overflow-free at the maintained mobile width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const pair of counterpartPairs) {
    for (const side of [pair.es, pair.en]) {
      await expectCanonicalRoute(page, side);
      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(
        geometry.scrollWidth,
        `${side.pathname} horizontal overflow`,
      ).toBeLessThanOrEqual(geometry.clientWidth);
    }
  }
});

test('non-canonical English projects alias and representative locale misses remain real 404s', async ({
  page,
}) => {
  for (const route of [
    './projects/',
    './missing-final-audit/',
    './en/missing-final-audit/',
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
  }
});

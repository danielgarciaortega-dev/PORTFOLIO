import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const cases = [
  {
    route: './sobre-mi/',
    locale: 'es',
    title: 'SOBRE MÍ · Daniel García Ortega',
    heading: 'Daniel García Ortega',
    role: 'Desarrollador web full-stack',
    location: 'Granada, España',
    journey: 'Recorrido',
    contribution: 'Qué aporto',
    seeking: 'Qué busco',
    counterpartName: 'Cambiar a inglés',
    counterpartHref: '/PORTFOLIO/en/about/',
    projectsHref: '/PORTFOLIO/proyectos/',
    cvHref: '/PORTFOLIO/cv/opciones/',
    projectsAction: 'Ver proyectos',
    cvAction: 'Ver CV',
    contactAction: 'Contactar',
    canonical: 'http://127.0.0.1:4321/PORTFOLIO/sobre-mi/',
  },
  {
    route: './en/about/',
    locale: 'en',
    title: 'ABOUT · Daniel García Ortega',
    heading: 'Daniel García Ortega',
    role: 'Full-stack web developer',
    location: 'Granada, Spain',
    journey: 'Journey',
    contribution: 'What I bring',
    seeking: "What I'm looking for",
    counterpartName: 'Switch to Spanish',
    counterpartHref: '/PORTFOLIO/sobre-mi/',
    projectsHref: '/PORTFOLIO/en/projects/',
    cvHref: '/PORTFOLIO/en/cv/options/',
    projectsAction: 'View projects',
    cvAction: 'View CV',
    contactAction: 'Contact',
    canonical: 'http://127.0.0.1:4321/PORTFOLIO/en/about/',
  },
] as const;

for (const routeCase of cases) {
  test(`About route ${routeCase.locale} renders the editorial profile from localized data`, async ({
    page,
  }) => {
    const response = await page.goto(routeCase.route);
    expect(response?.ok()).toBe(true);

    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      routeCase.locale,
    );
    await expect(page).toHaveTitle(routeCase.title);
    await expect(page.locator('[data-about-page]')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 1, name: routeCase.heading }),
    ).toBeVisible();
    await expect(page.getByText(routeCase.role, { exact: true })).toBeVisible();
    await expect(
      page.getByText(routeCase.location, { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { level: 2, name: routeCase.journey }),
    ).toBeVisible();
    await expect(page.locator('.about-page__milestones > li')).toHaveCount(4);
    await expect(
      page.locator('.about-page__values').getByText(routeCase.contribution, {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.locator('.about-page__values').getByText(routeCase.seeking, {
        exact: true,
      }),
    ).toBeVisible();

    const main = page.locator('main[data-about-page]');
    await expect(
      main.getByRole('link', { name: routeCase.projectsAction }),
    ).toHaveAttribute('href', routeCase.projectsHref);
    await expect(
      main.getByRole('link', { name: routeCase.cvAction }),
    ).toHaveAttribute('href', routeCase.cvHref);
    await expect(
      main.getByRole('link', { name: routeCase.contactAction }),
    ).toHaveAttribute('href', 'mailto:dangarort123@gmail.com');
    await expect(main.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
    await expect(main.getByRole('link', { name: 'LinkedIn' })).toHaveCount(0);

    const counterpart = page
      .locator('.site-header__actions')
      .getByRole('link', { name: routeCase.counterpartName });
    await expect(counterpart).toHaveAttribute(
      'href',
      routeCase.counterpartHref,
    );

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      routeCase.canonical,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang]'),
    ).toHaveCount(2);

    const visibleText = await main.innerText();
    expect(visibleText).not.toMatch(/(^|\s)0[1-4](\s|$)/);

    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

for (const width of [360, 390, 430, 1440]) {
  test(`About routes stay overflow-free at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });

    for (const routeCase of cases) {
      await page.goto(routeCase.route);
      const geometry = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth);
    }
  });
}

test('About primary content remains available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  for (const routeCase of cases) {
    const response = await page.goto(routeCase.route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('[data-about-page]')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: routeCase.heading }),
    ).toBeVisible();
    await expect(page.locator('.about-page__milestones > li')).toHaveCount(4);
  }

  await context.close();
});

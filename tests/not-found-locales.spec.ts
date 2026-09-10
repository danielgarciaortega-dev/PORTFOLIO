import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}

test('Spanish missing route keeps HTTP 404 and the default localized shell', async ({
  page,
}) => {
  const response = await page.goto('./ruta-inexistente/');

  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(/\/PORTFOLIO\/ruta-inexistente\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page).toHaveTitle('Página no encontrada · Daniel García Ortega');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'La página solicitada no existe.',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Esta ruta no forma parte del proyecto.',
    }),
  ).toBeVisible();

  const actions = page.locator('[data-not-found-actions]');
  await expect(actions.getByRole('link')).toHaveCount(2);
  await expect(
    actions.getByRole('link', { name: 'Volver al inicio' }),
  ).toHaveAttribute('href', '/PORTFOLIO/');
  await expect(
    actions.getByRole('link', { name: 'Ver proyectos' }),
  ).toHaveAttribute('href', '/PORTFOLIO/proyectos/');

  const navigation = page.getByRole('navigation', {
    name: 'Navegación principal',
  });
  await expect(
    navigation.getByRole('link', { name: 'Inicio' }),
  ).toHaveAttribute('href', '/PORTFOLIO/');
  await expect(
    navigation.getByRole('button', { name: 'Sobre mí' }),
  ).toBeVisible();
  await expect(
    navigation.getByRole('link', { name: 'Proyectos' }),
  ).toHaveAttribute('href', '/PORTFOLIO/proyectos/');

  const visibleLocaleAction = page
    .locator('.site-header__actions [data-language-switcher]')
    .getByRole('link', { name: 'Cambiar a inglés' });
  await expect(visibleLocaleAction).toHaveText('EN');
  await expect(visibleLocaleAction).toHaveAttribute('href', '/PORTFOLIO/en/');
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
});

test('English-prefixed missing route keeps HTTP 404 and localizes the one shell', async ({
  page,
}) => {
  const response = await page.goto('./en/missing/');

  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/missing\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle('Page not found · Daniel García Ortega');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'The requested page does not exist.',
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    'content',
    'en_GB',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'This route is not part of the project.',
    }),
  ).toBeVisible();

  const actions = page.locator('[data-not-found-actions]');
  await expect(actions.getByRole('link')).toHaveCount(2);
  await expect(
    actions.getByRole('link', { name: 'Back to home' }),
  ).toHaveAttribute('href', '/PORTFOLIO/en/');
  await expect(
    actions.getByRole('link', { name: 'View projects' }),
  ).toHaveAttribute('href', '/PORTFOLIO/en/projects/');

  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(navigation.getByRole('link', { name: 'Home' })).toHaveAttribute(
    'href',
    '/PORTFOLIO/en/',
  );
  const aboutTrigger = navigation.getByRole('button', { name: 'About' });
  await expect(aboutTrigger).toBeVisible();
  await expect(
    navigation.getByRole('link', { name: 'Projects' }),
  ).toHaveAttribute('href', '/PORTFOLIO/en/projects/');

  const visibleLocaleAction = page
    .locator('.site-header__actions [data-language-switcher]')
    .getByRole('link', { name: 'Switch to Spanish' });
  await expect(visibleLocaleAction).toHaveText('ES');
  await expect(visibleLocaleAction).toHaveAttribute('href', '/PORTFOLIO/');

  await aboutTrigger.click();
  const aboutDialog = page.getByRole('dialog', {
    name: 'Daniel García Ortega',
  });
  await expect(aboutDialog).toBeVisible();
  await expect(aboutDialog.locator('[data-about-eyebrow]')).toHaveText('ABOUT');
  await expect(aboutDialog.locator('[data-about-education-title]')).toHaveText(
    'Education and projects',
  );
  await expect(aboutDialog.locator('[data-about-seeking-title]')).toHaveText(
    "What I'm looking for",
  );
  await expect(
    aboutDialog.getByRole('button', { name: 'Close About' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(aboutDialog).toBeHidden();
  await expect(aboutTrigger).toBeFocused();
});

test('English 404 mobile menu stays localized, usable and overflow-free', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto('./en/mobile-missing/');

  expect(response?.status()).toBe(404);
  const trigger = page.getByRole('button', { name: 'Open menu' });
  await trigger.click();

  const menu = page.getByRole('dialog', { name: 'Navigation' });
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-label', 'Close menu');
  const navigation = menu.getByRole('navigation', {
    name: 'Mobile navigation',
  });
  await expect(navigation.getByRole('link', { name: /Home/ })).toHaveAttribute(
    'href',
    '/PORTFOLIO/en/',
  );
  await expect(navigation.getByRole('button', { name: /About/ })).toBeVisible();
  await expect(
    navigation.getByRole('link', { name: /Projects/ }),
  ).toHaveAttribute('href', '/PORTFOLIO/en/projects/');
  await expect(
    menu.getByRole('link', { name: 'Switch to Spanish' }),
  ).toHaveAttribute('href', '/PORTFOLIO/');
  await expect(menu.getByRole('link', { name: 'View CV' })).toHaveAttribute(
    'href',
    '/PORTFOLIO/cv/',
  );

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);

  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-label', 'Open menu');
  await expect(trigger).toBeFocused();
});

test('representative Spanish and English 404 states pass axe', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const route of ['./missing-a11y/', './en/missing-a11y/']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
    await expectNoAxeViolations(page);
  }
});

test('unscoped English projects alias remains a real 404', async ({ page }) => {
  const response = await page.goto('./projects/');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(/\/PORTFOLIO\/projects\/$/);
});

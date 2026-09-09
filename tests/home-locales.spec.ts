import { expect, test } from '@playwright/test';

test('Spanish root renders the restored shell, hero and professional overview', async ({
  page,
}) => {
  await page.goto('./');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  const mainNavigation = page.getByRole('navigation', {
    name: 'Navegación principal',
  });
  await expect(
    mainNavigation.getByRole('link', { name: 'Inicio' }),
  ).toBeVisible();
  await expect(
    mainNavigation.getByRole('button', { name: 'Sobre mí' }),
  ).toBeVisible();
  await expect(
    mainNavigation.getByRole('link', { name: 'Proyectos' }),
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Conocer mi perfil' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Contactar' }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Ver todos los proyectos' }),
  ).toHaveAttribute('href', '/PORTFOLIO/proyectos/');

  await expect(page.locator('.hero__description')).toHaveText(
    'Estudiante de 2º curso de Desarrollo de Aplicaciones Web, en búsqueda activa de una empresa donde realizar las prácticas de este curso.',
  );

  const overview = page.locator('.home-overview');
  await expect(overview).toHaveAttribute('aria-label', 'Resumen profesional');
  await expect(overview).toContainText('Tecnologías');
  await expect(overview).toContainText('Formación');
  await expect(overview).toContainText('Experiencia');
  await expect(overview).toContainText('Datos');
  await expect(overview).toContainText('Herramientas');
  await expect(overview).toContainText('APIs REST');
  await expect(
    overview.locator('.home-overview__technologies li img'),
  ).toHaveCount(22);

  const footer = page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toContainText(
    'Desarrollador web full-stack · Granada, España',
  );
});

test('language switcher navigates between locale routes and persists explicit choice', async ({
  page,
}) => {
  await page.goto('./');

  const spanishSwitcher = page.locator(
    '.desktop-navigation [data-language-switcher]',
  );
  await expect(spanishSwitcher.locator('[aria-current="true"]')).toHaveText(
    'ES',
  );
  await expect(
    spanishSwitcher.getByRole('link', { name: 'English' }),
  ).toHaveAttribute('href', '/PORTFOLIO/en/');

  await spanishSwitcher.getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('en');

  const englishSwitcher = page.locator(
    '.desktop-navigation [data-language-switcher]',
  );
  await expect(englishSwitcher.locator('[aria-current="true"]')).toHaveText(
    'EN',
  );
  await englishSwitcher.getByRole('link', { name: 'Spanish' }).click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/$/);
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('es');
});

test('Spanish mobile menu exposes the locale control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  await page.getByRole('button', { name: 'Abrir menú' }).click();
  const menu = page.getByRole('dialog', { name: 'Navegación' });
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-language-switcher]')).toBeVisible();
  await expect(
    menu.locator('[data-language-switcher]').getByRole('link', {
      name: 'English',
    }),
  ).toHaveAttribute('href', '/PORTFOLIO/en/');
});

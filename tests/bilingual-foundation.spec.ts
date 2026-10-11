import { expect, test } from '@playwright/test';

test('bilingual foundation stays coherent across switching, reload and remaining dialogs', async ({
  page,
}) => {
  await page.goto('./');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  const spanishOverview = page.locator('.home-overview');
  await expect(spanishOverview).toContainText('Formación');
  await expect(spanishOverview).toContainText('Desarrollador web en prácticas');
  await expect(spanishOverview).toContainText('APIs REST');

  await page.getByRole('link', { name: 'Conocer mi perfil' }).click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/sobre-mi\/$/);
  await expect(page.locator('[data-about-page]')).toBeVisible();
  await expect(page.locator('#about-dialog')).toHaveCount(0);

  await page.goto('./');
  await page.getByRole('button', { name: 'Contactar' }).first().click();
  const spanishContact = page.getByRole('dialog', { name: 'Hablemos.' });
  await expect(
    spanishContact.getByRole('button', { name: 'Copiar correo' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

  const spanishSwitcher = page.locator(
    '.site-header__actions [data-language-switcher]',
  );
  await expect(spanishSwitcher.getByRole('link')).toHaveCount(1);
  await spanishSwitcher.getByRole('link', { name: 'Cambiar a inglés' }).click();

  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('en');

  const englishOverview = page.locator('.home-overview');
  await expect(englishOverview).toContainText('Education');
  await expect(englishOverview).toContainText('Web Development Intern');
  await expect(englishOverview).toContainText('REST APIs');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('en');

  await page.getByRole('link', { name: 'View profile' }).click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/about\/$/);
  await expect(page.locator('[data-about-page]')).toBeVisible();
  await expect(page.locator('#about-dialog')).toHaveCount(0);

  await page.goto('./en/');
  await page.getByRole('button', { name: 'Contact' }).first().click();
  const englishContact = page.getByRole('dialog', {
    name: 'Get in touch.',
  });
  await expect(
    englishContact.getByRole('button', { name: 'Copy email' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

  const englishSwitcher = page.locator(
    '.site-header__actions [data-language-switcher]',
  );
  await expect(englishSwitcher.getByRole('link')).toHaveCount(1);
  await englishSwitcher
    .getByRole('link', { name: 'Switch to Spanish' })
    .click();

  await expect(page).toHaveURL(/\/PORTFOLIO\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('es');
});

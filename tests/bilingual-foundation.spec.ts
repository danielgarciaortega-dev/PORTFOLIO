import { expect, test } from '@playwright/test';

test(
  'bilingual foundation stays coherent across switching, reload and dialogs',
  async ({ page }) => {
    await page.goto('./');

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    const spanishOverview = page.locator('.home-overview');
    await expect(spanishOverview).toContainText('Formación');
    await expect(spanishOverview).toContainText(
      'Desarrollador web en prácticas',
    );
    await expect(spanishOverview).toContainText('APIs REST');

    await page
      .getByRole('button', { name: 'Sobre mí', exact: true })
      .first()
      .click();
    const spanishAbout = page.getByRole('dialog', {
      name: 'Daniel García Ortega',
    });
    await expect(spanishAbout).toContainText('Formación y proyectos');
    await expect(
      spanishAbout.getByRole('button', { name: 'Cerrar Sobre mí' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Contactar' }).first().click();
    const spanishContact = page.getByRole('dialog', { name: 'Hablemos.' });
    await expect(
      spanishContact.getByRole('button', { name: 'Copiar correo' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

    const spanishSwitcher = page.locator(
      '.desktop-navigation [data-language-switcher]',
    );
    await spanishSwitcher.getByRole('link', { name: 'English' }).click();

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

    await page
      .getByRole('button', { name: 'About', exact: true })
      .first()
      .click();
    const englishAbout = page.getByRole('dialog', {
      name: 'Daniel García Ortega',
    });
    await expect(englishAbout).toContainText('Education and projects');
    await expect(
      englishAbout.getByRole('button', { name: 'Close About' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Contact' }).first().click();
    const englishContact = page.getByRole('dialog', {
      name: 'Get in touch.',
    });
    await expect(
      englishContact.getByRole('button', { name: 'Copy email' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

    const englishSwitcher = page.locator(
      '.desktop-navigation [data-language-switcher]',
    );
    await englishSwitcher.getByRole('link', { name: 'Spanish' }).click();

    await expect(page).toHaveURL(/\/PORTFOLIO\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
      )
      .toBe('es');
  },
);

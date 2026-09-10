import { expect, test } from '@playwright/test';

test('projects route removes footer-only Contact infrastructure while preserving shell utilities', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./proyectos/');

  await expect(page.locator('.site-footer')).toHaveCount(0);
  await expect(page.locator('#contact-dialog')).toHaveCount(0);

  const header = page.locator('[data-site-header]');
  const socials = header.locator('[data-header-socials]');
  await expect(socials.getByRole('link')).toHaveCount(2);
  await expect(socials.getByRole('link', { name: 'GitHub' })).toBeVisible();
  await expect(socials.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
  await expect(header.locator('.header-cv-link')).toHaveCount(1);
  await expect(header.locator('[data-language-switcher]')).toHaveCount(1);

  await page
    .getByRole('button', { name: 'Sobre mí', exact: true })
    .first()
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Daniel García Ortega' }),
  ).toBeVisible();
});

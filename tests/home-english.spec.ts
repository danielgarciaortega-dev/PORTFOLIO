import { expect, test } from '@playwright/test';

test('homepage shell and hero use the approved English copy', async ({
  page,
}) => {
  await page.goto('./');

  const mainNavigation = page.getByRole('navigation', {
    name: 'Main navigation',
  });
  await expect(
    mainNavigation.getByRole('link', { name: 'Home' }),
  ).toBeVisible();
  await expect(
    mainNavigation.getByRole('button', { name: 'About' }),
  ).toBeVisible();
  await expect(
    mainNavigation.getByRole('link', { name: 'Projects' }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'View CV' }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'View profile' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Contact' }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View all projects' }),
  ).toBeVisible();

  await expect(page.locator('.hero__description')).toHaveText(
    "I'm in my second year of Web Application Development and currently looking for a company where I can complete my internship.",
  );

  await expect(page.locator('.home-overview')).toContainText('Technologies');
  await expect(page.locator('.home-overview')).toContainText('Education');
  await expect(page.locator('.home-overview')).toContainText('Experience');

  const footer = page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toContainText(
    'Full-stack web developer · Granada, Spain',
  );
});

test('mobile navigation exposes English accessible names', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  await page.getByRole('button', { name: 'Open menu' }).click();
  const menu = page.getByRole('dialog', { name: 'Navigation' });
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole('navigation', { name: 'Mobile navigation' }),
  ).toContainText('Home');
  await expect(menu.getByRole('button', { name: 'Close menu' })).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('professional overview uses the approved English education, experience and technology copy', async ({
  page,
}) => {
  await page.goto('./');

  const overview = page.locator('.home-overview');
  await expect(overview).toBeVisible();
  await expect(overview).toHaveAttribute('aria-label', 'Professional overview');

  await expect(overview.getByText('Technologies', { exact: true })).toBeVisible();
  await expect(overview.getByText('Education', { exact: true })).toBeVisible();
  await expect(overview.getByText('Experience', { exact: true })).toBeVisible();

  await expect(
    overview.getByRole('heading', {
      name: 'Higher Technician in Web Application Development',
    }),
  ).toBeVisible();
  await expect(
    overview.getByRole('heading', {
      name: 'Technician in Administrative Management',
    }),
  ).toBeVisible();
  await expect(overview).toContainText('2025 — Present');

  await expect(
    overview.getByRole('heading', { name: 'Web Development Intern' }),
  ).toBeVisible();
  await expect(
    overview.getByRole('heading', {
      name: 'Telesales and Customer Service',
    }),
  ).toBeVisible();
  await expect(
    overview.getByRole('heading', { name: 'Customer Service' }),
  ).toBeVisible();
  await expect(overview).toContainText('Healthcare SaaS platform');

  await expect(overview.getByText('Data', { exact: true })).toBeVisible();
  await expect(overview.getByText('Tools', { exact: true })).toBeVisible();
  await expect(overview.getByText('REST APIs', { exact: true })).toBeVisible();

  await expect(overview.locator('.home-overview__technologies li')).toHaveCount(22);
  await expect(overview.locator('.home-overview__technologies li img')).toHaveCount(
    22,
  );
});

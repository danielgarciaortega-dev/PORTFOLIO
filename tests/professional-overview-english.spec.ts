import { expect, test } from '@playwright/test';

test('professional overview uses approved English copy', async ({ page }) => {
  await page.goto('./en/');

  const overview = page.locator('.home-overview');
  await expect(overview).toBeVisible();
  await expect(overview).toHaveAttribute('aria-label', 'Professional overview');

  await expect(overview).toContainText('Technologies');
  await expect(overview).toContainText('Education');
  await expect(overview).toContainText('Experience');
  await expect(overview).toContainText(
    'Higher Technician in Web Application Development',
  );
  await expect(overview).toContainText(
    'Technician in Administrative Management',
  );
  await expect(overview).toContainText('2025 — Present');

  await expect(overview).toContainText('Web Development Intern');
  await expect(overview).toContainText('Telesales and Customer Service');
  await expect(overview).toContainText('Customer Service');
  await expect(overview).toContainText('Healthcare SaaS platform');

  await expect(overview).toContainText('Data');
  await expect(overview).toContainText('Tools');
  await expect(overview).toContainText('REST APIs');

  const technologies = overview.locator('.home-overview__technologies');
  await expect(technologies.locator('li')).toHaveCount(22);
  await expect(technologies.locator('li img')).toHaveCount(22);
});

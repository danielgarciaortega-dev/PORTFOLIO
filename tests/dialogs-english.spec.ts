import { expect, test } from '@playwright/test';

test('Contact dialog uses the approved English copy', async ({ page }) => {
  await page.goto('./en/');

  await page.getByRole('button', { name: 'Contact' }).first().click();
  const contactDialog = page.getByRole('dialog', { name: 'Get in touch.' });
  await expect(contactDialog).toBeVisible();
  await expect(contactDialog).toContainText('CONTACT');
  await expect(contactDialog).toContainText(
    'Email me or find me on LinkedIn and GitHub.',
  );
  await expect(
    contactDialog.getByRole('button', { name: 'Copy email' }),
  ).toBeVisible();
  await expect(
    contactDialog.getByRole('button', { name: 'Close Contact' }),
  ).toBeVisible();
});

test('clipboard fallback is English and selects the email address', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto('./en/');
  await page.getByRole('button', { name: 'Contact' }).first().click();
  await page.getByRole('button', { name: 'Copy email' }).click();

  const status = page.locator('[data-copy-status]');
  await expect(status).toHaveText(
    'Email selected. Press Ctrl+C or Command+C to copy it.',
  );
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
    .toBe('dangarort123@gmail.com');
});

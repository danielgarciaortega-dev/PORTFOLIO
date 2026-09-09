import { expect, test } from '@playwright/test';

test('About and Contact dialogs use the approved English copy', async ({
  page,
}) => {
  await page.goto('./');

  await page
    .getByRole('button', { name: 'About', exact: true })
    .first()
    .click();
  const aboutDialog = page.getByRole('dialog', {
    name: 'Daniel García Ortega',
  });
  await expect(aboutDialog).toBeVisible();
  await expect(aboutDialog).toContainText('ABOUT');
  await expect(aboutDialog).toContainText(
    'After nearly ten years in customer service and sales at Alcampo and Konecta, I switched to software development a year ago and started studying Web Application Development.',
  );
  await expect(
    aboutDialog.getByRole('heading', { name: 'Education and projects' }),
  ).toBeVisible();
  await expect(
    aboutDialog.getByRole('heading', { name: "What I'm looking for" }),
  ).toBeVisible();
  await expect(
    aboutDialog.getByRole('button', { name: 'Close About' }),
  ).toBeVisible();
  await expect(
    aboutDialog.getByRole('link', { name: 'View GitHub' }),
  ).toBeVisible();
  await expect(
    aboutDialog.getByRole('link', { name: 'View LinkedIn' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

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
  await page.goto('./');
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

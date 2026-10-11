import { expect, test } from '@playwright/test';

const routesWithoutLegacyAbout = [
  './',
  './en/',
  './proyectos/',
  './en/projects/',
  './missing-about-cleanup/',
  './en/missing-about-cleanup/',
] as const;

test('legacy About dialog infrastructure is absent from localized routes', async ({
  page,
}) => {
  for (const route of routesWithoutLegacyAbout) {
    await page.goto(route);

    await expect(page.locator('#about-dialog')).toHaveCount(0);
    await expect(page.locator('[data-about-dialog]')).toHaveCount(0);
    await expect(page.locator('[data-dialog-open="about-dialog"]')).toHaveCount(
      0,
    );
  }
});

test('Contact and Project dialogs keep Escape and focus restoration', async ({
  page,
}) => {
  await page.goto('./');

  const contactTrigger = page
    .getByRole('button', { name: 'Contactar' })
    .first();
  await contactTrigger.focus();
  await contactTrigger.click();

  const contactDialog = page.getByRole('dialog', { name: 'Hablemos.' });
  await expect(contactDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(contactDialog).toBeHidden();
  await expect(contactTrigger).toBeFocused();

  const projectTrigger = page.getByRole('button', {
    name: 'Ver proyecto AL-LÍO',
  });
  await projectTrigger.focus();
  await projectTrigger.click();

  const projectDialog = page.locator('dialog.project-dialog[open]');
  await expect(projectDialog).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(projectDialog).toHaveCount(0);
  await expect(projectTrigger).toBeFocused();
});

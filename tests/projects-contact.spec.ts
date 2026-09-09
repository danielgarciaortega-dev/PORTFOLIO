import { expect, test } from '@playwright/test';

test('projects footer Contact trigger opens the Spanish Contact dialog', async ({
  page,
}) => {
  await page.goto('./proyectos/');

  const footer = page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();
  const trigger = footer.getByRole('button', { name: 'Contactar' });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Hablemos.' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('CONTACTO');
  await expect(
    dialog.getByRole('button', { name: 'Copiar correo' }),
  ).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

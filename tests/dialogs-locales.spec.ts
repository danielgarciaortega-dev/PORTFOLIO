import { expect, test } from '@playwright/test';

test('Contact dialog recovers the original Spanish copy', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: 'Contactar' }).first().click();
  const contactDialog = page.getByRole('dialog', { name: 'Hablemos.' });
  await expect(contactDialog).toBeVisible();
  await expect(contactDialog).toContainText('CONTACTO');
  await expect(contactDialog).toContainText(
    'Escríbeme por correo o encuéntrame en mis perfiles.',
  );
  await expect(
    contactDialog.getByRole('button', { name: 'Copiar correo' }),
  ).toBeVisible();
  await expect(
    contactDialog.getByRole('button', { name: 'Cerrar Contacto' }),
  ).toBeVisible();
});

test('Spanish clipboard feedback covers success and fallback', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  await page.getByRole('button', { name: 'Contactar' }).first().click();
  await page.getByRole('button', { name: 'Copiar correo' }).click();
  await expect(page.locator('[data-copy-status]')).toHaveText('Correo copiado');

  await page.reload();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
  });
  await page.reload();
  await page.getByRole('button', { name: 'Contactar' }).first().click();
  await page.getByRole('button', { name: 'Copiar correo' }).click();
  await expect(page.locator('[data-copy-status]')).toHaveText(
    'Correo seleccionado. Pulsa Ctrl+C o Comando+C para copiarlo.',
  );
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
    .toBe('dangarort123@gmail.com');
});

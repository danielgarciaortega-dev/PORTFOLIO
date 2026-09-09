import { expect, test } from '@playwright/test';

test('About and Contact dialogs recover the original Spanish copy', async ({
  page,
}) => {
  await page.goto('./');

  await page
    .getByRole('button', { name: 'Sobre mí', exact: true })
    .first()
    .click();
  const aboutDialog = page.getByRole('dialog', {
    name: 'Daniel García Ortega',
  });
  await expect(aboutDialog).toBeVisible();
  await expect(aboutDialog).toContainText('SOBRE MÍ');
  await expect(aboutDialog).toContainText(
    'Pasé casi diez años en atención al cliente y ventas, en Alcampo y Konecta, hasta que decidí, hace 1 año, dar el salto a la programación estudiando Desarrollo de Aplicaciones Web.',
  );
  await expect(
    aboutDialog.getByRole('heading', { name: 'Formación y proyectos' }),
  ).toBeVisible();
  await expect(
    aboutDialog.getByRole('heading', { name: 'Qué busco' }),
  ).toBeVisible();
  await expect(
    aboutDialog.getByRole('button', { name: 'Cerrar Sobre mí' }),
  ).toBeVisible();
  await expect(
    aboutDialog.getByRole('link', { name: 'Ver GitHub' }),
  ).toBeVisible();
  await expect(
    aboutDialog.getByRole('link', { name: 'Ver LinkedIn' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

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

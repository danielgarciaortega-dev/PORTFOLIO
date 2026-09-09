import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}

test('inicio sin violaciones automatizadas de axe', async ({ page }) => {
  await page.goto('./');
  await expectNoAxeViolations(page);
});

test('proyectos sin violaciones automatizadas de axe', async ({ page }) => {
  await page.goto('./proyectos/');
  await expectNoAxeViolations(page);
});

test('Sobre mí abierto sin violaciones automatizadas de axe', async ({
  page,
}) => {
  await page.goto('./');
  await page
    .getByRole('button', { name: 'Sobre mí', exact: true })
    .first()
    .click();
  await expectNoAxeViolations(page);
});

test('Contacto abierto sin violaciones automatizadas de axe', async ({
  page,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Contactar' }).first().click();
  await expectNoAxeViolations(page);
});

test('modal de proyecto abierto sin violaciones automatizadas de axe', async ({
  page,
}) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Ver proyecto AL-LÍO' }).click();
  await expectNoAxeViolations(page);
});

test('menú móvil abierto sin violaciones automatizadas de axe', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await expectNoAxeViolations(page);
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('CV standalone browser controls remain accessible landmark content', async ({
  page,
}) => {
  const response = await page.goto('./cv/');
  expect(response?.ok()).toBe(true);

  const backLink = page.getByRole('link', {
    name: 'Volver al portfolio de Daniel García Ortega',
  });
  const downloadLink = page.getByRole('link', {
    name: 'Descargar CV de Daniel García Ortega en PDF',
  });

  await expect(backLink).toBeVisible();
  await expect(backLink).toHaveAttribute('href', '../');
  await expect(downloadLink).toBeVisible();
  await expect(downloadLink).toHaveAttribute(
    'href',
    'CV-Daniel-Garcia-Ortega.pdf',
  );

  expect(
    await backLink.evaluate(
      (element) =>
        element.closest('nav')?.getAttribute('aria-label') ===
        'Navegación del CV',
    ),
  ).toBe(true);
  expect(
    await downloadLink.evaluate(
      (element) =>
        element.closest('nav')?.getAttribute('aria-label') ===
        'Acciones del CV',
    ),
  ).toBe(true);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

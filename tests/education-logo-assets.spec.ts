import { expect, test } from '@playwright/test';

test('el logo de FOC usa el activo SVG limpio con fondo blanco', async ({
  page,
}) => {
  const response = await page.request.get('./images/education/foc.svg');

  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('image/svg+xml');

  const svg = await response.text();
  expect(svg).toContain('<rect width="128" height="128" fill="#ffffff"/>');
  expect(svg).toContain('data:image/webp;base64,');
});

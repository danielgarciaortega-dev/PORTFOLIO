import { expect, test, type Response } from '@playwright/test';

const cases = [
  {
    locale: 'es',
    route: './cv/',
    filename: 'CV-Daniel-Garcia-Ortega.pdf',
    href: 'CV-Daniel-Garcia-Ortega.pdf',
    label: 'Descargar CV de Daniel García Ortega en PDF',
  },
  {
    locale: 'en',
    route: './en/cv/',
    filename: 'CV-Daniel-Garcia-Ortega-EN.pdf',
    href: 'CV-Daniel-Garcia-Ortega-EN.pdf',
    label: 'Download Daniel García Ortega CV as PDF',
  },
] as const;

for (const localeCase of cases) {
  test(`${localeCase.locale} CV downloads only its own non-empty PDF`, async ({
    page,
    request,
  }) => {
    const response = await page.goto(localeCase.route);
    expect(response?.ok()).toBe(true);

    const downloadLink = page.getByRole('link', { name: localeCase.label });
    await expect(downloadLink).toHaveCount(1);
    await expect(downloadLink).toHaveAttribute('href', localeCase.href);
    await expect(downloadLink).toHaveAttribute('download', '');

    const pdfResponse = await request.get(
      new URL(localeCase.href, page.url()).href,
    );
    expect(pdfResponse.status()).toBe(200);
    expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
    const body = await pdfResponse.body();
    expect(body.length).toBeGreaterThan(1000);
    expect(body.subarray(0, 4).toString()).toBe('%PDF');
  });
}

test('English CV never exposes the Spanish legacy PDF as a fallback', async ({
  page,
}) => {
  await page.goto('./en/cv/');
  await expect(
    page.locator('a[href="../../cv/CV-Daniel-Garcia-Ortega.pdf"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('a[href="CV-Daniel-Garcia-Ortega.pdf"]'),
  ).toHaveCount(0);
});

test('both locale PDFs are served without local resource failures', async ({
  page,
}) => {
  const failed: string[] = [];
  const onResponse = (response: Response) => {
    const url = new URL(response.url());
    if (url.hostname === '127.0.0.1' && response.status() >= 400) {
      failed.push(`${response.status()} ${url.pathname}`);
    }
  };

  page.on('response', onResponse);
  await page.goto('./cv/');
  await page.goto('./en/cv/');
  expect(failed).toEqual([]);
  page.off('response', onResponse);
});

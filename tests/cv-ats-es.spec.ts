import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Spanish ATS CV is semantic, complete and text-first', async ({
  page,
}) => {
  const response = await page.goto('./cv/ats/');
  expect(response?.ok()).toBe(true);

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Daniel García Ortega' }),
  ).toBeVisible();

  for (const heading of [
    'Perfil profesional',
    'Stack técnico',
    'Experiencia profesional',
    'Proyectos destacados',
    'Formación académica',
    'Idiomas',
    'Información adicional',
  ]) {
    await expect(
      page.getByRole('heading', { level: 2, name: heading }),
    ).toBeVisible();
  }

  await expect(page.locator('table')).toHaveCount(0);
  await expect(page.locator('img')).toHaveCount(0);
  await expect(page.locator('.ats-document')).toContainText('AL-LÍO');
  await expect(page.locator('.ats-document')).toContainText(
    'SIDN Cost Control',
  );
  await expect(page.locator('.ats-document')).toContainText('Feedback2Action');
  await expect(page.locator('.ats-document')).toContainText('Salunox');
  await expect(page.locator('.ats-document')).toContainText('Konecta');
  await expect(page.locator('.ats-document')).toContainText('Alcampo');
  await expect(page.locator('.ats-document')).toContainText(
    'Instituto Fomento Ocupacional FOC',
  );
  await expect(page.locator('.ats-document')).toContainText(
    'Discapacidad reconocida: 34%',
  );
  await expect(page.locator('.ats-document')).toContainText('Prisma');
  await expect(page.locator('.ats-document')).toContainText('Docker');
  await expect(page.locator('.ats-document')).not.toContainText('Vercel');
  const spanishDownload = page.getByRole('link', { name: 'Descargar PDF' });
  await expect(spanishDownload).toHaveAttribute(
    'href',
    'CV-Daniel-Garcia-Ortega-ATS.pdf',
  );
  await expect(spanishDownload).toHaveAttribute('download', '');

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('ATS toolbars keep only selector navigation and the correct download', async ({
  page,
}) => {
  for (const viewer of [
    {
      route: './cv/ats/',
      backName: '← Volver a CVs',
      backHref: '../opciones/',
      downloadName: 'Descargar PDF',
      downloadHref: 'CV-Daniel-Garcia-Ortega-ATS.pdf',
    },
    {
      route: './en/cv/ats/',
      backName: '← Back to CVs',
      backHref: '../options/',
      downloadName: 'Download PDF',
      downloadHref: 'CV-Daniel-Garcia-Ortega-ATS-EN.pdf',
    },
  ]) {
    await page.goto(viewer.route);

    const toolbar = page.locator('.ats-toolbar');
    await expect(toolbar.getByRole('link')).toHaveCount(2);
    await expect(
      toolbar.getByRole('link', { name: viewer.backName }),
    ).toHaveAttribute('href', viewer.backHref);
    await expect(
      toolbar.getByRole('link', { name: viewer.downloadName }),
    ).toHaveAttribute('href', viewer.downloadHref);
    await expect(
      toolbar.getByRole('link', { name: 'Portfolio', exact: true }),
    ).toHaveCount(0);

    await expect(page.locator('.ats-contact')).toContainText('Portfolio');
  }
});

for (const width of [360, 390, 430]) {
  test(`Spanish ATS CV has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./cv/ats/');

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('Spanish ATS print view hides browser navigation and keeps readable flow', async ({
  page,
}) => {
  await page.goto('./cv/ats/');
  await page.emulateMedia({ media: 'print' });

  await expect(page.locator('.ats-toolbar')).toHaveCSS('display', 'none');
  await expect(page.locator('.ats-document')).toBeVisible();

  const geometry = await page.locator('.ats-document').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      display: style.display,
      columns: style.columns,
      overflowX: style.overflowX,
    };
  });

  expect(geometry.display).toBe('block');
  expect(geometry.overflowX).not.toBe('scroll');
});

test('English ATS CV preserves the approved ATS structure and facts', async ({
  page,
}) => {
  const response = await page.goto('./en/cv/ats/');
  expect(response?.ok()).toBe(true);

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Daniel García Ortega' }),
  ).toBeVisible();

  for (const value of [
    'Salunox',
    'Konecta',
    'Alcampo',
    'AL-LÍO',
    'SIDN Cost Control',
    'Feedback2Action',
    'Instituto Fomento Ocupacional FOC',
    '22,376',
    '409',
    '108',
    'Prisma',
    'Docker',
    'Recognized disability: 34%',
  ]) {
    await expect(page.locator('.ats-document')).toContainText(value);
  }

  await expect(page.locator('table')).toHaveCount(0);
  await expect(page.locator('img')).toHaveCount(0);
  await expect(page.locator('.ats-document')).not.toContainText('Vercel');
  const englishDownload = page.getByRole('link', { name: 'Download PDF' });
  await expect(englishDownload).toHaveAttribute(
    'href',
    'CV-Daniel-Garcia-Ortega-ATS-EN.pdf',
  );
  await expect(englishDownload).toHaveAttribute('download', '');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

for (const width of [360, 390, 430]) {
  test(`English ATS CV has no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./en/cv/ats/');

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

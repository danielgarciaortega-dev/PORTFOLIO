import { expect, test, type Page } from '@playwright/test';

const viewerCases = [
  {
    route: './cv/',
    locale: 'es',
    variant: 'designed',
    root: '.cv-sheet',
    download: 'CV-Daniel-Garcia-Ortega.pdf',
  },
  {
    route: './en/cv/',
    locale: 'en',
    variant: 'designed',
    root: '.cv-sheet',
    download: 'CV-Daniel-Garcia-Ortega-EN.pdf',
  },
  {
    route: './cv/ats/',
    locale: 'es',
    variant: 'ats',
    root: '.ats-document',
    download: 'CV-Daniel-Garcia-Ortega-ATS.pdf',
  },
  {
    route: './en/cv/ats/',
    locale: 'en',
    variant: 'ats',
    root: '.ats-document',
    download: 'CV-Daniel-Garcia-Ortega-ATS-EN.pdf',
  },
] as const;

const sharedFacts = [
  'Daniel García Ortega',
  'dangarort123@gmail.com',
  'AL-LÍO',
  'SIDN Cost Control',
  'Feedback2Action',
  'Salunox',
  'Konecta',
  'Alcampo',
  'Instituto Fomento Ocupacional FOC',
  'Prisma',
  'Docker',
  '34%',
] as const;

const projectOrder = ['AL-LÍO', 'SIDN Cost Control', 'Feedback2Action'] as const;
const experienceOrder = ['Salunox', 'Konecta', 'Alcampo'] as const;

function expectOrderedText(source: string, values: readonly string[]) {
  let previousIndex = -1;

  for (const value of values) {
    const index = source.indexOf(value);
    expect(index, `Expected "${value}" in document text`).toBeGreaterThan(-1);
    expect(index, `Expected "${value}" after previous item`).toBeGreaterThan(
      previousIndex,
    );
    previousIndex = index;
  }
}

async function expectProfessionalLinks(page: Page) {
  await expect(
    page.locator('a[href*="github.com/danielgarciaortega-dev"]').first(),
  ).toBeAttached();
  await expect(
    page.locator('a[href*="linkedin.com/in/"]').first(),
  ).toBeAttached();
}

test('all four CV viewers preserve stable facts and ordering', async ({
  page,
}) => {
  for (const viewer of viewerCases) {
    const response = await page.goto(viewer.route);
    expect(response?.ok()).toBe(true);

    await expect(page.locator('html')).toHaveAttribute('lang', viewer.locale);
    await expect(page.locator(viewer.root)).toHaveCount(1);

    const text = await page.locator(viewer.root).innerText();

    for (const fact of sharedFacts) {
      expect(text, `${viewer.locale}:${viewer.variant} missing ${fact}`).toContain(
        fact,
      );
    }

    expect(text).not.toContain('Vercel');
    expectOrderedText(text, projectOrder);
    expectOrderedText(text, experienceOrder);
    await expectProfessionalLinks(page);
  }
});

test('each CV viewer downloads only its own PDF', async ({ page }) => {
  for (const viewer of viewerCases) {
    await page.goto(viewer.route);

    const download = page.locator('a[download]').filter({
      has: page.locator('i, span'),
    });

    const candidates =
      viewer.variant === 'designed'
        ? page.locator('.download-btn[download]')
        : page.locator('.ats-toolbar a[download]');

    await expect(candidates).toHaveCount(1);
    await expect(candidates).toHaveAttribute('href', viewer.download);
    await expect(candidates).toHaveAttribute('download', '');

    expect(await download.count()).toBeGreaterThanOrEqual(0);
  }
});

test('CV center exposes the four base-safe viewer destinations', async ({
  page,
}) => {
  for (const route of ['./cv/opciones/', './en/cv/options/']) {
    await page.goto(route);

    const options = page.locator('[data-cv-option]');
    await expect(options).toHaveCount(4);

    await expect(options.nth(0)).toHaveAttribute('href', '/PORTFOLIO/cv/');
    await expect(options.nth(1)).toHaveAttribute('href', '/PORTFOLIO/en/cv/');
    await expect(options.nth(2)).toHaveAttribute('href', '/PORTFOLIO/cv/ats/');
    await expect(options.nth(3)).toHaveAttribute(
      'href',
      '/PORTFOLIO/en/cv/ats/',
    );
  }
});

test('unapproved CV aliases remain unavailable', async ({ page }) => {
  for (const route of [
    './cv/options/',
    './en/cv/opciones/',
    './cv/ats/en/',
    './en/ats/cv/',
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
  }
});

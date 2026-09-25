import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function collectAtsFacts(page: Page) {
  return page.evaluate(() => ({
    name: document.querySelector('h1')?.textContent?.trim() ?? '',
    entries: Array.from(document.querySelectorAll('.ats-entry h3')).map(
      (node) => node.textContent?.trim(),
    ),
    dates: Array.from(document.querySelectorAll('.ats-entry time')).map(
      (node) => node.getAttribute('datetime'),
    ),
    professionalUrls: Array.from(
      document.querySelectorAll('.ats-contact a[target="_blank"]'),
    ).map((node) => node.getAttribute('href')),
    knowsAbout: JSON.parse(
      document.querySelector('script[type="application/ld+json"]')
        ?.textContent ?? '{}',
    ).knowsAbout,
  }));
}

test('English ATS CV mirrors the Spanish ATS factual contract', async ({
  page,
}) => {
  await page.goto('./cv/ats/');
  const es = await collectAtsFacts(page);

  const response = await page.goto('./en/cv/ats/');
  expect(response?.ok()).toBe(true);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  const en = await collectAtsFacts(page);
  expect(en).toEqual(es);

  for (const heading of [
    'Professional profile',
    'Technical stack',
    'Professional experience',
    'Featured projects',
    'Education',
    'Languages',
    'Additional information',
  ]) {
    await expect(
      page.getByRole('heading', { level: 2, name: heading }),
    ).toBeVisible();
  }

  await expect(page.locator('table')).toHaveCount(0);
  await expect(page.locator('img')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Vercel');
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

test('English ATS reuses the shared ATS stylesheet', async ({ page }) => {
  await page.goto('./en/cv/ats/');
  await expect(
    page.locator(
      'link[rel="stylesheet"][href="../../../cv/ats/styles.css"]',
    ),
  ).toHaveCount(1);
});

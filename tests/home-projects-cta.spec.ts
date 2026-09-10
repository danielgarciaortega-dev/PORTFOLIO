import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function readHeroSource() {
  return readFile(
    new URL('../src/components/home/Hero.astro', import.meta.url),
    'utf8',
  );
}

test('featured projects CTA uses the localized route contract in both locales', async ({
  page,
}) => {
  await page.goto('./');
  const spanishCta = page.getByRole('link', {
    name: 'Ver todos los proyectos',
  });
  await expect(spanishCta).toHaveAttribute('href', '/PORTFOLIO/proyectos/');

  await page.goto('./en/');
  const englishCta = page.getByRole('link', { name: 'View all projects' });
  await expect(englishCta).toHaveAttribute(
    'href',
    '/PORTFOLIO/en/projects/',
  );

  const source = await readHeroSource();
  expect(source).toContain("getLocalizedRoutePath(locale, 'projects')");
  expect(source).not.toContain("withBase('proyectos/')");
  expect(source).not.toContain("withBase('en/projects/')");
});

test('featured projects CTA arrow responds to pointer interaction without changing link semantics', async ({
  page,
}) => {
  await page.goto('./');

  const cta = page.getByRole('link', { name: 'Ver todos los proyectos' });
  const arrow = cta.locator('span[aria-hidden="true"]');

  await expect(cta).toHaveAttribute('href', '/PORTFOLIO/proyectos/');
  await expect(arrow).toHaveCSS('transform', 'none');

  await cta.hover();
  await expect
    .poll(() => arrow.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe('none');

  const source = await readHeroSource();
  expect(source).toContain('.hero__projects-link:focus-visible > span');
});

test('featured projects CTA suppresses translation motion for reduced-motion users', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');

  const cta = page.getByRole('link', { name: 'Ver todos los proyectos' });
  const arrow = cta.locator('span[aria-hidden="true"]');

  await cta.hover();
  await expect(arrow).toHaveCSS('transform', 'none');

  const transitionDurationSeconds = await arrow.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration),
  );
  expect(transitionDurationSeconds).toBeLessThanOrEqual(0.00001);
});

test('featured projects CTA does not introduce horizontal overflow across home breakpoints', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');

    const viewport = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
  }
});

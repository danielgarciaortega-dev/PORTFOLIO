import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const localeCases = [
  {
    route: './',
    lang: 'es',
    projectsCta: 'Ver todos los proyectos',
    projectsHref: '/PORTFOLIO/proyectos/',
    menuTrigger: 'Abrir menú',
    menuName: 'Navegación',
  },
  {
    route: './en/',
    lang: 'en',
    projectsCta: 'View all projects',
    projectsHref: '/PORTFOLIO/en/projects/',
    menuTrigger: 'Open menu',
    menuName: 'Navigation',
  },
] as const;

const viewportMatrix = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

async function expectNoHorizontalOverflow(page: Page, context: string) {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(geometry.scrollWidth, context).toBeLessThanOrEqual(
    geometry.clientWidth,
  );
}

async function expectVisibleControlsInsideViewport(
  page: Page,
  viewportWidth: number,
  context: string,
) {
  const controls = page.locator('a[href], button');
  const count = await controls.count();

  for (let index = 0; index < count; index += 1) {
    const control = controls.nth(index);
    if (!(await control.isVisible())) continue;

    const box = await control.boundingBox();
    if (!box) continue;

    expect(
      box.x,
      `${context} control ${index} left edge`,
    ).toBeGreaterThanOrEqual(-1);
    expect(
      box.x + box.width,
      `${context} control ${index} right edge`,
    ).toBeLessThanOrEqual(viewportWidth + 1);
  }
}

test('final bilingual home and shell stay coherent across the certification matrix', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const localeCase of localeCases) {
    for (const viewport of viewportMatrix) {
      await page.setViewportSize(viewport);
      await page.goto(localeCase.route);

      const context = `${localeCase.lang} ${viewport.width}x${viewport.height}`;
      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        localeCase.lang,
      );
      await expect(
        page.getByRole('link', { name: localeCase.projectsCta }),
      ).toHaveAttribute('href', localeCase.projectsHref);
      await expect(page.locator('.home-overview')).toBeVisible();
      await expect(page.locator('.project-preview__button')).toHaveCount(3);

      await expectNoHorizontalOverflow(page, context);
      await expectVisibleControlsInsideViewport(page, viewport.width, context);

      const overviewItems = page.locator(
        '.technology-group__label, .home-overview__fact h2',
      );
      const overviewCount = await overviewItems.count();
      for (let index = 0; index < overviewCount; index += 1) {
        const fits = await overviewItems
          .nth(index)
          .evaluate(
            (element) => element.scrollWidth <= element.clientWidth + 1,
          );
        expect(fits, `${context} overview item ${index}`).toBe(true);
      }

      const header = page.locator('[data-site-header]');
      if (viewport.width <= 900) {
        await expect(
          header.getByRole('button', { name: localeCase.menuTrigger }),
        ).toBeVisible();
        await expect(header.locator('.desktop-navigation')).toBeHidden();
        await expect(header.locator('.site-header__actions')).toBeHidden();
      } else {
        await expect(header.locator('.desktop-navigation')).toBeVisible();
        await expect(header.locator('.site-header__actions')).toBeVisible();
      }
    }
  }
});

test('final technology inventory remains locale-equivalent', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  const inventories: string[][] = [];
  for (const localeCase of localeCases) {
    await page.goto(localeCase.route);
    const technologies = await page
      .locator('.home-overview__technologies li')
      .allTextContents();
    inventories.push(technologies.map((technology) => technology.trim()));
  }

  expect(inventories[0]).toHaveLength(19);
  expect(inventories[1]).toEqual(inventories[0]);
});

test('reduced-motion keeps touched shell motion effectively disabled', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const trigger = page.getByRole('button', { name: 'Abrir menú' });
  await trigger.click();
  const menu = page.getByRole('dialog', { name: 'Navegación' });
  await expect(menu).toBeVisible();

  const menuDurations = await menu.evaluate((element) =>
    getComputedStyle(element)
      .transitionDuration.split(',')
      .map((value) => Number.parseFloat(value)),
  );
  expect(Math.max(...menuDurations)).toBeLessThanOrEqual(0.00001);

  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');

  const cta = page.getByRole('link', { name: 'Ver todos los proyectos' });
  const arrow = cta.locator('span[aria-hidden="true"]');
  await cta.hover();
  await expect(arrow).toHaveCSS('transform', 'none');
});

test('maintained source-of-truth docs preserve the delivered bilingual route contract', async () => {
  const [readme, agents, finalShell] = await Promise.all([
    readFile('README.md', 'utf8'),
    readFile('AGENTS.md', 'utf8'),
    readFile('docs/operations/FINAL_SHELL.md', 'utf8'),
  ]);

  for (const route of [
    '/en/',
    '/proyectos/',
    '/en/projects/',
    '/cv/',
    '/en/cv/',
  ]) {
    expect(readme).toContain(route);
    expect(agents).toContain(route);
    expect(finalShell).toContain(route);
  }

  expect(readme).toContain(
    'The unscoped `/projects/` alias is intentionally not part of the public route contract.',
  );
  expect(agents).toContain(
    '`/projects/` is not a canonical compatibility route and must remain absent unless separately approved.',
  );
  expect(finalShell).toContain(
    '`/projects/` is not a canonical alias and must remain absent unless separately approved;',
  );

  expect(readme).toContain('GitHub Pages is the only deployment target.');
  expect(agents).toContain('GitHub Pages is the only deployment target.');
  expect(finalShell).toContain('Both CV locales have independent PDF outputs');
});

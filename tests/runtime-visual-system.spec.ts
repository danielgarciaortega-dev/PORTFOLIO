import { readFile } from 'node:fs/promises';
import { expect, test, type Locator } from '@playwright/test';

async function getBox(locator: Locator) {
  const result = await locator.boundingBox();
  expect(result).not.toBeNull();
  return result!;
}

function getCssBlock(css: string, selector: string) {
  const start = css.indexOf(`${selector} {`);
  expect(start, `missing CSS block for ${selector}`).toBeGreaterThanOrEqual(0);
  const end = css.indexOf('\n}', start);
  expect(end, `unterminated CSS block for ${selector}`).toBeGreaterThan(start);
  return css.slice(start, end + 2);
}

test('runtime visual system loads after legacy global styles', async () => {
  const [layout, hero, overview] = await Promise.all([
    readFile('src/layouts/BaseLayout.astro', 'utf8'),
    readFile('src/components/home/Hero.astro', 'utf8'),
    readFile('src/components/home/OverviewStrip.astro', 'utf8'),
  ]);

  const globalImport = layout.indexOf("import '../styles/global.css';");
  const systemImport = layout.indexOf("import '../styles/visual-system.css';");

  expect(globalImport).toBeGreaterThanOrEqual(0);
  expect(systemImport).toBeGreaterThan(globalImport);
  expect(hero).toContain('width: min(100%, var(--layout-shell-width));');
  expect(overview).toContain('width: min(100%, var(--layout-shell-width));');
});

test('legacy global CSS no longer duplicates certified visual-system ownership', async () => {
  const css = await readFile('src/styles/global.css', 'utf8');

  for (const obsoleteSelector of [
    '.project-preview__number {',
    '.project-preview__body p {',
    '.project-preview__body h3 {',
    '.project-preview__mark--sidn-cost-control {',
    '.contact .eyebrow {',
  ]) {
    expect(css).not.toContain(obsoleteSelector);
  }

  expect(getCssBlock(css, '.eyebrow')).not.toContain('font-size: 0.76rem;');
  expect(getCssBlock(css, '.eyebrow')).not.toContain('font-weight: 800;');
  expect(getCssBlock(css, '.eyebrow')).not.toContain('letter-spacing: 0.16em;');
  expect(getCssBlock(css, '.site-header__inner')).not.toContain('width:');
  expect(getCssBlock(css, '.mobile-menu__head p')).not.toContain(
    'font-size: 0.76rem;',
  );
  expect(getCssBlock(css, '.mobile-menu__head p')).not.toContain(
    'font-weight: 800;',
  );
  expect(getCssBlock(css, '.mobile-menu__head p')).not.toContain(
    'letter-spacing: 0.16em;',
  );
  expect(getCssBlock(css, '.availability')).not.toContain('color: #176a48;');
  expect(getCssBlock(css, '.button-link--primary:hover')).not.toContain(
    'background: #b43f1d;',
  );
  expect(getCssBlock(css, '.contact-dialog__copy-status')).not.toContain(
    'color: #176a48;',
  );
  expect(getCssBlock(css, '.award-label')).not.toContain('color: #93421f;');
  expect(getCssBlock(css, '.project-row__meta span')).not.toContain(
    'color: #93421f;',
  );
  expect(getCssBlock(css, '.home-page .hero__grid')).not.toContain(
    'width: min(100%, 1536px);',
  );
  expect(getCssBlock(css, '.home-overview__inner')).not.toContain(
    'width: min(100%, 1536px);',
  );
});

test('semantic tokens preserve the certified runtime colors', async ({
  page,
}) => {
  await page.goto('./');

  const tokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const value = (name: string) => styles.getPropertyValue(name).trim();

    return {
      positive: value('--color-positive-text'),
      accentInk: value('--color-accent-ink'),
      projectMarkWarm: value('--color-project-mark-warm'),
      contactEyebrow: value('--color-contact-eyebrow'),
      accentPressed: value('--color-accent-pressed'),
      kickerSize: value('--type-kicker-size'),
      kickerWeight: value('--type-kicker-weight'),
      kickerTracking: value('--type-kicker-tracking'),
    };
  });

  expect(tokens).toEqual({
    positive: '#176a48',
    accentInk: '#93421f',
    projectMarkWarm: '#fff0df',
    contactEyebrow: '#f3b28e',
    accentPressed: '#b43f1d',
    kickerSize: '.76rem',
    kickerWeight: '800',
    kickerTracking: '.16em',
  });

  await expect(page.locator('.contact-dialog__copy-status')).toHaveCSS(
    'color',
    'rgb(23, 106, 72)',
  );
  await expect(page.locator('.award-label')).toHaveCSS(
    'color',
    'rgb(147, 66, 31)',
  );
  await expect(
    page.locator('.project-preview__mark--sidn-cost-control'),
  ).toHaveCSS('background-color', 'rgb(255, 240, 223)');

  const primaryAction = page.locator('.button-link--primary').first();
  await primaryAction.hover();
  await expect(primaryAction).toHaveCSS('background-color', 'rgb(180, 63, 29)');
});

test('one Inter font contract remains authoritative across Astro routes', async ({
  page,
}) => {
  const routes = ['./', './en/', './proyectos/', './en/projects/'] as const;
  const families: string[] = [];

  for (const route of routes) {
    await page.goto(route);
    const family = await page.locator('body').evaluate((element) => {
      return getComputedStyle(element).fontFamily;
    });
    families.push(family);
  }

  expect(families[0]).toContain('Inter');
  expect(new Set(families).size).toBe(1);
});

test('shared shell width keeps header, hero and overview aligned', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('./');

  const [header, hero, overview] = await Promise.all([
    getBox(page.locator('.site-header__inner')),
    getBox(page.locator('.home-page .hero__grid')),
    getBox(page.locator('.home-overview__inner')),
  ]);
  const headerRight = header.x + header.width;

  for (const target of [hero, overview]) {
    const targetRight = target.x + target.width;
    expect(Math.abs(target.x - header.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(targetRight - headerRight)).toBeLessThanOrEqual(1);
  }

  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth - window.innerWidth;
  });
  expect(overflow).toBeLessThanOrEqual(0);
});

test('shared kicker typography stays equivalent in shell and dialogs', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const shellKicker = page.locator('.mobile-menu__head p');
  const dialogKicker = page.locator('.project-dialog .eyebrow').first();

  for (const property of ['font-size', 'font-weight', 'letter-spacing']) {
    const shellValue = await shellKicker.evaluate((element, cssProperty) => {
      return getComputedStyle(element).getPropertyValue(cssProperty);
    }, property);
    const dialogValue = await dialogKicker.evaluate((element, cssProperty) => {
      return getComputedStyle(element).getPropertyValue(cssProperty);
    }, property);
    expect(dialogValue).toBe(shellValue);
  }
});

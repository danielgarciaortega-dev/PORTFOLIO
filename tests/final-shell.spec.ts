import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const desktopWidths = [1024, 1280, 1440, 1920];
const mobileWidths = [360, 390, 430];

const locales = [
  {
    path: './',
    navigation: 'Navegación principal',
    mobileNavigation: 'Navegación móvil',
    menu: 'Navegación',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    localeAction: 'Cambiar a inglés',
    localeText: 'EN',
    localeHref: '/PORTFOLIO/en/',
    cvText: 'Ver CV',
  },
  {
    path: './en/',
    navigation: 'Main navigation',
    mobileNavigation: 'Mobile navigation',
    menu: 'Navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    localeAction: 'Switch to Spanish',
    localeText: 'ES',
    localeHref: '/PORTFOLIO/',
    cvText: 'View CV',
  },
] as const;

async function expectNoHorizontalOverflow(page: Page, context: string) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(
    dimensions.scrollWidth,
    `${context}: document must not overflow horizontally`,
  ).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function expectMinimumTargetHeight(
  locator: ReturnType<Page['locator']>,
  context: string,
) {
  const box = await locator.boundingBox();
  expect(box, `${context}: target must have a rendered box`).not.toBeNull();
  expect(box?.height ?? 0, `${context}: target must remain at least 44px tall`).toBeGreaterThanOrEqual(
    43.5,
  );
}

test('final desktop shell contract holds in both locales at every supported desktop width', async ({
  page,
}) => {
  for (const width of desktopWidths) {
    await page.setViewportSize({ width, height: 900 });

    for (const locale of locales) {
      await page.goto(locale.path);

      const header = page.locator('[data-site-header]');
      const socials = header.locator('[data-header-socials]');
      const navigation = header.getByRole('navigation', {
        name: locale.navigation,
      });
      const actions = header.locator('.site-header__actions');
      const switcher = actions.locator('[data-language-switcher]');

      await expect(header).toBeVisible();
      await expect(socials).toBeVisible();
      await expect(socials.getByRole('link')).toHaveCount(2);
      await expect(socials.getByRole('link', { name: 'GitHub' })).toBeVisible();
      await expect(
        socials.getByRole('link', { name: 'LinkedIn' }),
      ).toBeVisible();

      await expect(navigation.locator('[data-language-switcher]')).toHaveCount(0);
      await expect(navigation.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
      await expect(
        navigation.getByRole('link', { name: 'LinkedIn' }),
      ).toHaveCount(0);

      await expect(switcher.getByRole('link')).toHaveCount(1);
      const localeAction = switcher.getByRole('link', {
        name: locale.localeAction,
      });
      await expect(localeAction).toBeVisible();
      await expect(localeAction).toHaveText(locale.localeText);
      await expect(localeAction).toHaveAttribute('href', locale.localeHref);
      await expect(switcher.locator('[aria-current="true"]')).toHaveCount(0);

      const cvAction = actions.getByRole('link', { name: locale.cvText });
      await expect(cvAction).toHaveCount(1);
      await expect(cvAction).toBeVisible();
      await expect(actions.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
      await expect(
        actions.getByRole('link', { name: 'LinkedIn' }),
      ).toHaveCount(0);

      await expect(page.locator('.site-footer')).toHaveCount(0);
      await expectNoHorizontalOverflow(page, `${locale.path} at ${width}px`);
    }
  }
});

test('final mobile shell keeps navigation and utilities separated in both locales', async ({
  page,
}) => {
  for (const width of mobileWidths) {
    await page.setViewportSize({ width, height: 844 });

    for (const locale of locales) {
      await page.goto(locale.path);

      const header = page.locator('[data-site-header]');
      const trigger = header.getByRole('button', { name: locale.openMenu });
      await expect(header.locator('[data-header-socials]')).toBeHidden();
      await expect(header.locator('.site-header__actions')).toBeHidden();
      await expect(trigger).toBeVisible();

      await trigger.click();

      const menu = page.getByRole('dialog', { name: locale.menu });
      const navigation = menu.getByRole('navigation', {
        name: locale.mobileNavigation,
      });
      const socials = menu.locator('[data-mobile-socials]');
      const utilities = menu.locator('[data-mobile-utilities]');
      const switcher = utilities.locator('[data-language-switcher]');

      await expect(menu).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(trigger).toHaveAttribute('aria-label', locale.closeMenu);
      await expect(navigation.locator('span')).toHaveText(['01', '02', '03']);
      await expect(navigation.locator('[data-language-switcher]')).toHaveCount(0);
      await expect(navigation.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
      await expect(
        navigation.getByRole('link', { name: 'LinkedIn' }),
      ).toHaveCount(0);

      await expect(socials.getByRole('link')).toHaveCount(2);
      const github = socials.getByRole('link', { name: 'GitHub' });
      const linkedin = socials.getByRole('link', { name: 'LinkedIn' });
      await expect(github).toBeVisible();
      await expect(linkedin).toBeVisible();

      await expect(switcher.getByRole('link')).toHaveCount(1);
      const localeAction = switcher.getByRole('link', {
        name: locale.localeAction,
      });
      await expect(localeAction).toHaveText(locale.localeText);
      await expect(localeAction).toHaveAttribute('href', locale.localeHref);

      const cvAction = utilities.getByRole('link', { name: locale.cvText });
      await expect(cvAction).toHaveCount(1);
      await expect(cvAction).toBeVisible();

      await expectMinimumTargetHeight(github, `${locale.path} GitHub at ${width}px`);
      await expectMinimumTargetHeight(
        linkedin,
        `${locale.path} LinkedIn at ${width}px`,
      );
      await expectMinimumTargetHeight(
        localeAction,
        `${locale.path} locale action at ${width}px`,
      );
      await expectMinimumTargetHeight(
        cvAction,
        `${locale.path} CV action at ${width}px`,
      );

      await expect(page.locator('.site-footer')).toHaveCount(0);
      await expectNoHorizontalOverflow(page, `${locale.path} menu at ${width}px`);

      await page.keyboard.press('Escape');
      await expect(menu).not.toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).toHaveAttribute('aria-label', locale.openMenu);
      await expect(trigger).toBeFocused();
    }
  }
});

test('locale counterpart persistence and remaining home dialogs stay functional', async ({
  page,
}) => {
  await page.goto('./');

  const toEnglish = page.getByRole('link', { name: 'Cambiar a inglés' });
  await expect(toEnglish).toHaveAttribute('href', '/PORTFOLIO/en/');
  await toEnglish.click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('portfolio.locale')))
    .toBe('en');

  const toSpanish = page.getByRole('link', { name: 'Switch to Spanish' });
  await expect(toSpanish).toHaveAttribute('href', '/PORTFOLIO/');
  await toSpanish.click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('portfolio.locale')))
    .toBe('es');

  const contactTrigger = page.getByRole('button', { name: 'Contactar' }).first();
  await contactTrigger.click();
  const contactDialog = page.getByRole('dialog', { name: 'Hablemos.' });
  await expect(contactDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(contactDialog).toBeHidden();
  await expect(contactTrigger).toBeFocused();

  const aboutTrigger = page
    .getByRole('button', { name: 'Sobre mí', exact: true })
    .first();
  await aboutTrigger.click();
  const aboutDialog = page.getByRole('dialog', {
    name: 'Daniel García Ortega',
  });
  await expect(aboutDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(aboutDialog).toBeHidden();
  await expect(aboutTrigger).toBeFocused();
});

test('representative English desktop and mobile shell states remain axe-clean', async ({
  page,
}) => {
  await page.goto('./en/');
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./en/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();

  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

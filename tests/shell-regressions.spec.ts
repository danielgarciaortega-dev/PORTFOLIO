import { expect, test, type Page } from '@playwright/test';

interface LocaleCase {
  locale: 'es' | 'en';
  route: string;
  navigation: string;
  mobileNavigation: string;
  menu: string;
  openMenu: string;
  localeAction: string;
  localeHref: string;
  cv: string;
  mobileCv: string;
}

const localeCases: LocaleCase[] = [
  {
    locale: 'es',
    route: './',
    navigation: 'Navegación principal',
    mobileNavigation: 'Navegación móvil',
    menu: 'Navegación',
    openMenu: 'Abrir menú',
    localeAction: 'Cambiar a inglés',
    localeHref: '/PORTFOLIO/en/',
    cv: 'Ver CV',
    mobileCv: 'Consultar CV',
  },
  {
    locale: 'en',
    route: './en/',
    navigation: 'Main navigation',
    mobileNavigation: 'Mobile navigation',
    menu: 'Navigation',
    openMenu: 'Open menu',
    localeAction: 'Switch to Spanish',
    localeHref: '/PORTFOLIO/',
    cv: 'View CV',
    mobileCv: 'View CV',
  },
];

const desktopWidths = [1024, 1280, 1440, 1920];
const mobileWidths = [360, 390, 430];

async function expectNoHorizontalOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, context).toBeLessThanOrEqual(0);
}

test('final desktop shell contract stays deterministic across supported widths and locales', async ({
  page,
}) => {
  for (const localeCase of localeCases) {
    for (const width of desktopWidths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(localeCase.route);

      const header = page.locator('[data-site-header]');
      const socials = header.locator('[data-header-socials]');
      const navigation = header.getByRole('navigation', {
        name: localeCase.navigation,
      });
      const actions = header.locator('.site-header__actions');

      await expect(header).toBeVisible();
      await expect(page.locator('.site-footer')).toHaveCount(0);
      await expect(socials).toBeVisible();
      await expect(socials.getByRole('link')).toHaveCount(2);
      await expect(socials.getByRole('link', { name: 'GitHub' })).toBeVisible();
      await expect(
        socials.getByRole('link', { name: 'LinkedIn' }),
      ).toBeVisible();

      await expect(navigation.locator('[data-language-switcher]')).toHaveCount(
        0,
      );
      await expect(
        navigation.getByRole('link', { name: 'GitHub' }),
      ).toHaveCount(0);
      await expect(
        navigation.getByRole('link', { name: 'LinkedIn' }),
      ).toHaveCount(0);

      const localeLink = actions.getByRole('link', {
        name: localeCase.localeAction,
      });
      await expect(localeLink).toHaveCount(1);
      await expect(localeLink).toHaveAttribute('href', localeCase.localeHref);
      await expect(
        actions.getByRole('link', { name: localeCase.cv }),
      ).toHaveCount(1);
      await expect(
        page.locator('[data-language-switcher]:visible'),
      ).toHaveCount(1);

      await expectNoHorizontalOverflow(
        page,
        `${localeCase.locale} desktop ${width}px`,
      );
    }
  }
});

test('final mobile shell keeps navigation and utilities separate without overflow', async ({
  page,
}) => {
  for (const localeCase of localeCases) {
    for (const width of mobileWidths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(localeCase.route);

      const header = page.locator('[data-site-header]');
      const trigger = header.getByRole('button', {
        name: localeCase.openMenu,
      });

      await expect(page.locator('.site-footer')).toHaveCount(0);
      await expect(header.locator('[data-header-socials]')).toBeHidden();
      await expect(header.locator('.site-header__actions')).toBeHidden();
      await expect(trigger).toBeVisible();

      await trigger.focus();
      await page.keyboard.press('Enter');

      const menu = page.getByRole('dialog', { name: localeCase.menu });
      const navigation = menu.getByRole('navigation', {
        name: localeCase.mobileNavigation,
      });
      const socials = menu.locator('[data-mobile-socials]');
      const utilities = menu.locator('[data-mobile-utilities]');

      await expect(menu).toBeVisible();
      await expect(navigation.locator('[data-language-switcher]')).toHaveCount(
        0,
      );
      await expect(
        navigation.getByRole('link', { name: 'GitHub' }),
      ).toHaveCount(0);
      await expect(
        navigation.getByRole('link', { name: 'LinkedIn' }),
      ).toHaveCount(0);
      await expect(socials.getByRole('link')).toHaveCount(2);
      await expect(socials.getByRole('link', { name: 'GitHub' })).toBeVisible();
      await expect(
        socials.getByRole('link', { name: 'LinkedIn' }),
      ).toBeVisible();

      const localeLink = utilities.getByRole('link', {
        name: localeCase.localeAction,
      });
      await expect(localeLink).toHaveCount(1);
      await expect(localeLink).toHaveAttribute('href', localeCase.localeHref);
      await expect(
        utilities.getByRole('link', { name: localeCase.mobileCv }),
      ).toHaveCount(1);
      await expect(
        page.locator('[data-language-switcher]:visible'),
      ).toHaveCount(1);

      await expectNoHorizontalOverflow(
        page,
        `${localeCase.locale} mobile ${width}px with menu open`,
      );

      await page.keyboard.press('Escape');
      await expect(menu).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
  }
});

test('locale round trip remains base-path safe and persists the explicit choice', async ({
  page,
}) => {
  await page.goto('./');

  const englishLink = page
    .locator('.site-header__actions')
    .getByRole('link', { name: 'Cambiar a inglés' });
  await expect(englishLink).toHaveAttribute('href', '/PORTFOLIO/en/');
  await englishLink.click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/$/);
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('en');

  const spanishLink = page
    .locator('.site-header__actions')
    .getByRole('link', { name: 'Switch to Spanish' });
  await expect(spanishLink).toHaveAttribute('href', '/PORTFOLIO/');
  await spanishLink.click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/$/);
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('es');
});

test('remaining About and Contact triggers match mounted dialogs after footer removal', async ({
  page,
}) => {
  await page.goto('./');

  const aboutTrigger = page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: 'Sobre mí' });
  await aboutTrigger.click();
  const aboutDialog = page.getByRole('dialog', {
    name: 'Daniel García Ortega',
  });
  await expect(aboutDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(aboutDialog).toBeHidden();
  await expect(aboutTrigger).toBeFocused();

  const contactTrigger = page
    .getByRole('button', { name: 'Contactar' })
    .first();
  await contactTrigger.click();
  const contactDialog = page.getByRole('dialog', { name: 'Hablemos.' });
  await expect(contactDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(contactDialog).toBeHidden();
  await expect(contactTrigger).toBeFocused();

  await page.goto('./proyectos/');
  await expect(page.locator('#contact-dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Contactar' })).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('button', { name: 'Sobre mí' }),
  ).toBeVisible();
});

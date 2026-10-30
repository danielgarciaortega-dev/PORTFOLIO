import { expect, test } from '@playwright/test';

const cases = [
  {
    locale: 'es',
    homeRoute: './',
    aboutPath: '/PORTFOLIO/sobre-mi/',
    aboutLabel: 'Sobre mí',
    desktopNavigation: 'Navegación principal',
    mobileNavigation: 'Navegación móvil',
    openMenu: 'Abrir menú',
    menu: 'Navegación',
    counterpartName: 'Cambiar a inglés',
    counterpartHref: '/PORTFOLIO/en/about/',
  },
  {
    locale: 'en',
    homeRoute: './en/',
    aboutPath: '/PORTFOLIO/en/about/',
    aboutLabel: 'About',
    desktopNavigation: 'Main navigation',
    mobileNavigation: 'Mobile navigation',
    openMenu: 'Open menu',
    menu: 'Navigation',
    counterpartName: 'Switch to Spanish',
    counterpartHref: '/PORTFOLIO/sobre-mi/',
  },
] as const;

for (const routeCase of cases) {
  test(`desktop About navigation is absent from main navigation in ${routeCase.locale}`, async ({
    page,
  }) => {
    await page.goto(routeCase.homeRoute);

    const aboutLink = page
      .getByRole('navigation', { name: routeCase.desktopNavigation })
      .getByRole('link', { name: routeCase.aboutLabel });

    await expect(aboutLink).toHaveCount(0);
  });

  test(`mobile About navigation is absent from mobile navigation in ${routeCase.locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(routeCase.homeRoute);

    const menuTrigger = page.getByRole('button', { name: routeCase.openMenu });
    await menuTrigger.click();

    const menu = page.getByRole('dialog', { name: routeCase.menu });
    const aboutLink = menu
      .getByRole('navigation', { name: routeCase.mobileNavigation })
      .getByRole('link', { name: routeCase.aboutLabel });

    await expect(aboutLink).toHaveCount(0);
  });
}

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
  test(`desktop About navigation is a keyboard-accessible link in ${routeCase.locale}`, async ({
    page,
  }) => {
    await page.goto(routeCase.homeRoute);

    const aboutLink = page
      .getByRole('navigation', { name: routeCase.desktopNavigation })
      .getByRole('link', { name: routeCase.aboutLabel });

    await expect(aboutLink).toHaveAttribute('href', routeCase.aboutPath);
    await expect(aboutLink).not.toHaveAttribute('aria-current', 'page');

    await aboutLink.focus();
    await expect(aboutLink).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(new RegExp(`${routeCase.aboutPath}$`));
    await expect(page.locator('#about-dialog')).toHaveCount(0);

    const activeAboutLink = page
      .getByRole('navigation', { name: routeCase.desktopNavigation })
      .getByRole('link', { name: routeCase.aboutLabel });
    await expect(activeAboutLink).toHaveAttribute('aria-current', 'page');

    await expect(
      page
        .locator('.site-header__actions')
        .getByRole('link', { name: routeCase.counterpartName }),
    ).toHaveAttribute('href', routeCase.counterpartHref);
  });

  test(`mobile About navigation is direct and active in ${routeCase.locale}`, async ({
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

    await expect(aboutLink).toHaveAttribute('href', routeCase.aboutPath);
    await aboutLink.focus();
    await expect(aboutLink).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(new RegExp(`${routeCase.aboutPath}$`));
    await expect(page.locator('#about-dialog')).toHaveCount(0);

    await page.getByRole('button', { name: routeCase.openMenu }).click();
    const activeMenu = page.getByRole('dialog', { name: routeCase.menu });
    const activeAboutLink = activeMenu
      .getByRole('navigation', { name: routeCase.mobileNavigation })
      .getByRole('link', { name: routeCase.aboutLabel });

    await expect(activeAboutLink).toHaveAttribute('aria-current', 'page');
    await expect
      .poll(() => activeAboutLink.evaluate((element) => getComputedStyle(element).fontWeight))
      .toBe('800');
  });
}

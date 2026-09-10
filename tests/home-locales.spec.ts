import { expect, test } from '@playwright/test';

test('Spanish root renders the restored shell, hero and professional overview', async ({
  page,
}) => {
  await page.goto('./');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  const mainNavigation = page.getByRole('navigation', {
    name: 'Navegación principal',
  });
  await expect(
    mainNavigation.getByRole('link', { name: 'Inicio' }),
  ).toBeVisible();
  await expect(
    mainNavigation.getByRole('button', { name: 'Sobre mí' }),
  ).toBeVisible();
  await expect(
    mainNavigation.getByRole('link', { name: 'Proyectos' }),
  ).toBeVisible();
  await expect(mainNavigation.locator('[data-language-switcher]')).toHaveCount(
    0,
  );

  await expect(
    page.getByRole('button', { name: 'Conocer mi perfil' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Contactar' }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Ver todos los proyectos' }),
  ).toHaveAttribute('href', '/PORTFOLIO/proyectos/');

  await expect(page.locator('.hero__description')).toHaveText(
    'Estudiante de 2º curso de Desarrollo de Aplicaciones Web, en búsqueda activa de una empresa donde realizar las prácticas de este curso.',
  );

  const overview = page.locator('.home-overview');
  await expect(overview).toHaveAttribute('aria-label', 'Resumen profesional');
  await expect(overview).toContainText('Tecnologías');
  await expect(overview).toContainText('Formación');
  await expect(overview).toContainText('Experiencia');
  await expect(overview).toContainText('Datos');
  await expect(overview).toContainText('Herramientas');
  await expect(overview).toContainText('APIs REST');
  await expect(
    overview.locator('.home-overview__technologies li img'),
  ).toHaveCount(22);

  const footer = page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toContainText(
    'Desarrollador web full-stack · Granada, España',
  );
});

test('language switcher exposes one target-locale action and persists explicit choice', async ({
  page,
}) => {
  await page.goto('./');

  const headerActions = page.locator('.site-header__actions');
  const spanishSwitcher = headerActions.locator('[data-language-switcher]');
  const cvLink = headerActions.locator('.header-cv-link');

  await expect(headerActions).toBeVisible();
  await expect(spanishSwitcher).toBeVisible();
  await expect(cvLink).toBeVisible();
  await expect(spanishSwitcher.getByRole('link')).toHaveCount(1);
  await expect(spanishSwitcher.locator('[aria-current="true"]')).toHaveCount(0);

  const englishLink = spanishSwitcher.getByRole('link', {
    name: 'Cambiar a inglés',
  });
  await expect(englishLink).toHaveText('EN');
  await expect(englishLink).toHaveAttribute('href', '/PORTFOLIO/en/');
  await expect(englishLink).toHaveAttribute('hreflang', 'en');

  const desktopAppearance = await spanishSwitcher.evaluate((switcher) => {
    const switcherStyles = getComputedStyle(switcher);
    const link = switcher.querySelector<HTMLElement>('a');
    const linkStyles = link ? getComputedStyle(link) : null;

    return {
      borderTopWidth: switcherStyles.borderTopWidth,
      backgroundColor: switcherStyles.backgroundColor,
      linkBackgroundColor: linkStyles?.backgroundColor ?? null,
    };
  });

  expect(desktopAppearance).toEqual({
    borderTopWidth: '0px',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    linkBackgroundColor: 'rgba(0, 0, 0, 0)',
  });

  await englishLink.hover();
  await expect
    .poll(() =>
      englishLink.evaluate(
        (link) => getComputedStyle(link, '::after').transform,
      ),
    )
    .not.toBe('matrix(0, 0, 0, 1, 0, 0)');

  await expect(cvLink).toHaveCSS('border-top-width', '1px');

  await englishLink.click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('en');

  const englishSwitcher = page.locator(
    '.site-header__actions [data-language-switcher]',
  );
  await expect(englishSwitcher.getByRole('link')).toHaveCount(1);
  await expect(englishSwitcher.locator('[aria-current="true"]')).toHaveCount(0);

  const spanishLink = englishSwitcher.getByRole('link', {
    name: 'Switch to Spanish',
  });
  await expect(spanishLink).toHaveText('ES');
  await expect(spanishLink).toHaveAttribute('href', '/PORTFOLIO/');
  await expect(spanishLink).toHaveAttribute('hreflang', 'es');

  await spanishLink.click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/$/);
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('es');
});

test('desktop header utility cluster does not overflow compact desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('./');

  await expect(page.locator('.site-header__actions')).toBeVisible();

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

test('Spanish mobile menu keeps the single locale action outside primary navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  await page.getByRole('button', { name: 'Abrir menú' }).click();
  const menu = page.getByRole('dialog', { name: 'Navegación' });
  const switcher = menu.locator('[data-language-switcher]');

  await expect(menu).toBeVisible();
  await expect(menu.locator('nav [data-language-switcher]')).toHaveCount(0);
  await expect(switcher).toBeVisible();
  await expect(switcher.getByRole('link')).toHaveCount(1);

  const englishLink = switcher.getByRole('link', {
    name: 'Cambiar a inglés',
  });
  await expect(englishLink).toHaveText('EN');
  await expect(englishLink).toHaveAttribute('href', '/PORTFOLIO/en/');
});

test('desktop shell keeps socials left, navigation clean and locale plus CV right', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('./');

  const header = page.locator('[data-site-header]');
  const socials = header.locator('[data-header-socials]');
  const navigation = header.getByRole('navigation', {
    name: 'Navegación principal',
  });
  const actions = header.locator('.site-header__actions');

  await expect(socials).toBeVisible();
  await expect(socials.getByRole('link')).toHaveCount(2);
  await expect(socials.getByRole('link', { name: 'GitHub' })).toBeVisible();
  await expect(socials.getByRole('link', { name: 'LinkedIn' })).toBeVisible();

  await expect(navigation.locator('[data-language-switcher]')).toHaveCount(0);
  await expect(navigation.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
  await expect(navigation.getByRole('link', { name: 'LinkedIn' })).toHaveCount(
    0,
  );

  await expect(
    actions.getByRole('link', { name: 'Cambiar a inglés' }),
  ).toHaveCount(1);
  await expect(actions.locator('.header-cv-link')).toHaveCount(1);
  await expect(actions.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
  await expect(actions.getByRole('link', { name: 'LinkedIn' })).toHaveCount(0);
});

test('mobile shell separates numbered navigation from social and locale/CV utilities', async ({
  page,
}) => {
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('./');

    const header = page.locator('[data-site-header]');
    const trigger = header.getByRole('button', { name: 'Abrir menú' });

    await expect(header.locator('[data-header-socials]')).toBeHidden();
    await expect(header.locator('.site-header__actions')).toBeHidden();
    await expect(trigger).toBeVisible();

    await trigger.focus();
    await page.keyboard.press('Enter');

    const menu = page.getByRole('dialog', { name: 'Navegación' });
    const navigation = menu.getByRole('navigation', {
      name: 'Navegación móvil',
    });
    const socials = menu.locator('[data-mobile-socials]');
    const utilities = menu.locator('[data-mobile-utilities]');

    await expect(menu).toBeVisible();
    await expect(navigation.locator('span')).toHaveText(['01', '02', '03']);
    await expect(navigation.locator('[data-language-switcher]')).toHaveCount(0);
    await expect(navigation.getByRole('link', { name: 'GitHub' })).toHaveCount(
      0,
    );
    await expect(
      navigation.getByRole('link', { name: 'LinkedIn' }),
    ).toHaveCount(0);

    await expect(socials.getByRole('link')).toHaveCount(2);
    await expect(socials.getByRole('link', { name: 'GitHub' })).toBeVisible();
    await expect(socials.getByRole('link', { name: 'LinkedIn' })).toBeVisible();

    await expect(
      utilities.getByRole('link', { name: 'Cambiar a inglés' }),
    ).toHaveCount(1);
    await expect(utilities.locator('.mobile-menu__cv')).toHaveCount(1);

    const viewport = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);

    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-label', 'Abrir menú');
  }
});

test('English mobile menu keeps localized trigger labels through open and Escape close', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./en/');

  const trigger = page.locator('[data-menu-open]');
  await expect(trigger).toHaveAttribute('aria-label', 'Open menu');
  await trigger.click();

  const menu = page.getByRole('dialog', { name: 'Navigation' });
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-label', 'Close menu');

  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(trigger).toHaveAttribute('aria-label', 'Open menu');
  await expect(trigger).toBeFocused();
});

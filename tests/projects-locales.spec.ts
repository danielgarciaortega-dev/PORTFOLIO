import { expect, test, type Response } from '@playwright/test';

const projectTitles = ['AL-LÍO', 'SIDN Cost Control', 'Feedback2Action'];

const routeCases = [
  {
    locale: 'es',
    route: './proyectos/',
    heading: 'Proyectos',
    mainNavigation: 'Navegación principal',
    mobileNavigation: 'Navegación móvil',
    menu: 'Navegación',
    openMenu: 'Abrir menú',
    projects: 'Proyectos',
    projectsHref: '/PORTFOLIO/proyectos/',
    switchLabel: 'Cambiar a inglés',
    switchHref: '/PORTFOLIO/en/projects/',
    cvHref: '/PORTFOLIO/cv/',
    viewFeedback: 'Ver proyecto Feedback2Action',
    about: 'Sobre mí',
    aboutCopy: 'Formación y proyectos',
    localizedDescription: 'centraliza tareas',
  },
  {
    locale: 'en',
    route: './en/projects/',
    heading: 'Projects',
    mainNavigation: 'Main navigation',
    mobileNavigation: 'Mobile navigation',
    menu: 'Navigation',
    openMenu: 'Open menu',
    projects: 'Projects',
    projectsHref: '/PORTFOLIO/en/projects/',
    switchLabel: 'Switch to Spanish',
    switchHref: '/PORTFOLIO/proyectos/',
    cvHref: '/PORTFOLIO/en/cv/',
    viewFeedback: 'View project Feedback2Action',
    about: 'About',
    aboutCopy: 'Education and projects',
    localizedDescription: 'brings tasks',
  },
] as const;

test('Spanish project cards keep unique accessible CTAs and Spanish dialog copy', async ({
  page,
}) => {
  await page.goto('./proyectos/');

  for (const title of projectTitles) {
    await expect(
      page.getByRole('button', { name: `Ver proyecto ${title}` }),
    ).toHaveCount(1);
  }

  await page.getByRole('button', { name: 'Ver proyecto AL-LÍO' }).click();
  const dialog = page.getByRole('dialog', { name: 'AL-LÍO' });
  await expect(dialog).toContainText('PROYECTO');
  await expect(dialog.getByRole('heading', { name: 'Objetivo' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Solución' })).toBeVisible();
  await expect(
    dialog.getByRole('link', { name: 'Abrir demo de AL-LÍO' }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('link', { name: 'Ver código de AL-LÍO' }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Cerrar AL-LÍO' }),
  ).toBeVisible();
});

test('English home uses approved project copy and unique accessible CTAs', async ({
  page,
}) => {
  await page.goto('./en/');

  for (const title of projectTitles) {
    await expect(
      page.getByRole('button', { name: `View project ${title}` }),
    ).toHaveCount(1);
  }

  await page.getByRole('button', { name: 'View project AL-LÍO' }).click();
  const alLioDialog = page.getByRole('dialog', { name: 'AL-LÍO' });
  await expect(alLioDialog).toContainText('PROJECT');
  await expect(
    alLioDialog.getByRole('heading', { name: 'Objective' }),
  ).toBeVisible();
  await expect(
    alLioDialog.getByRole('heading', { name: 'Solution' }),
  ).toBeVisible();
  await expect(alLioDialog).toContainText(
    'AL-LÍO brings tasks, calendar, learning and professional opportunities into one place to reduce switching between separate tools.',
  );
  await expect(
    alLioDialog.getByRole('link', { name: 'Open AL-LÍO demo' }),
  ).toBeVisible();
  await expect(
    alLioDialog.getByRole('link', { name: 'View AL-LÍO code' }),
  ).toBeVisible();
  await expect(
    alLioDialog.getByRole('button', { name: 'Close AL-LÍO' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

  await page
    .getByRole('button', { name: 'View project Feedback2Action' })
    .click();
  const feedbackDialog = page.getByRole('dialog', { name: 'Feedback2Action' });
  await expect(feedbackDialog).toContainText('22,376 reviews analyzed');
  await expect(feedbackDialog).toContainText('409 problem groups');
  await expect(feedbackDialog).toContainText('108 prioritized actions');
});

test('Spanish and English projects indexes preserve structure with localized copy', async ({
  page,
}) => {
  for (const routeCase of routeCases) {
    const failedLocalResources: string[] = [];
    const onResponse = (response: Response) => {
      const url = new URL(response.url());
      if (url.hostname === '127.0.0.1' && response.status() >= 400) {
        failedLocalResources.push(`${response.status()} ${url.pathname}`);
      }
    };

    page.on('response', onResponse);
    const response = await page.goto(routeCase.route);

    expect(response?.ok()).toBe(true);
    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      routeCase.locale,
    );
    await expect(
      page.getByRole('heading', { level: 1, name: routeCase.heading }),
    ).toBeAttached();
    await expect(page.locator('.project-row')).toHaveCount(3);
    await expect(page.locator('.project-row h2')).toHaveText(projectTitles);
    await expect(
      page.locator('.project-row__description').first(),
    ).toContainText(routeCase.localizedDescription);

    const navigation = page.getByRole('navigation', {
      name: routeCase.mainNavigation,
    });
    const projectsLink = navigation.getByRole('link', {
      name: routeCase.projects,
    });
    await expect(projectsLink).toHaveAttribute('href', routeCase.projectsHref);
    await expect(projectsLink).toHaveAttribute('aria-current', 'page');

    const localeLink = page
      .locator('.site-header__actions')
      .getByRole('link', { name: routeCase.switchLabel });
    await expect(localeLink).toHaveAttribute('href', routeCase.switchHref);
    await expect(page.locator('.header-cv-link')).toHaveAttribute(
      'href',
      routeCase.cvHref,
    );
    await expect(page.locator('.site-footer')).toHaveCount(0);

    await page.getByRole('button', { name: routeCase.viewFeedback }).click();
    await expect(
      page.getByRole('dialog', { name: 'Feedback2Action' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');

    const aboutTrigger = navigation.getByRole('button', {
      name: routeCase.about,
    });
    await aboutTrigger.click();
    const aboutDialog = page.getByRole('dialog', {
      name: 'Daniel García Ortega',
    });
    await expect(aboutDialog).toContainText(routeCase.aboutCopy);
    await page.keyboard.press('Escape');

    expect(failedLocalResources).toEqual([]);
    page.off('response', onResponse);
  }
});

test('projects locale switch round trip is base-safe and persists the choice', async ({
  page,
}) => {
  await page.goto('./proyectos/');

  const englishLink = page
    .locator('.site-header__actions')
    .getByRole('link', { name: 'Cambiar a inglés' });
  await expect(englishLink).toHaveAttribute('href', '/PORTFOLIO/en/projects/');
  await englishLink.click();

  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/projects\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('en');

  const spanishLink = page
    .locator('.site-header__actions')
    .getByRole('link', { name: 'Switch to Spanish' });
  await expect(spanishLink).toHaveAttribute('href', '/PORTFOLIO/proyectos/');
  await spanishLink.click();

  await expect(page).toHaveURL(/\/PORTFOLIO\/proyectos\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect
    .poll(() =>
      page.evaluate(() => window.localStorage.getItem('portfolio.locale')),
    )
    .toBe('es');
});

test('mobile projects navigation keeps locale-aware destinations without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const routeCase of routeCases) {
    await page.goto(routeCase.route);
    await page.getByRole('button', { name: routeCase.openMenu }).click();

    const menu = page.getByRole('dialog', { name: routeCase.menu });
    const navigation = menu.getByRole('navigation', {
      name: routeCase.mobileNavigation,
    });
    await expect(
      navigation.getByRole('link', { name: routeCase.projects }),
    ).toHaveAttribute('href', routeCase.projectsHref);
    await expect(
      menu.getByRole('link', { name: routeCase.switchLabel }),
    ).toHaveAttribute('href', routeCase.switchHref);
    await expect(page.locator('[data-language-switcher]:visible')).toHaveCount(
      1,
    );

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
  }
});

test('unscoped English projects alias is not introduced', async ({ page }) => {
  const response = await page.goto('./projects/');
  expect(response?.status()).toBe(404);
});

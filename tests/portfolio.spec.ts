import { expect, test } from '@playwright/test';

test('inicio, navegación y Sobre mí funcionan con ruta base', async ({
  page,
}) => {
  await page.goto('./');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Daniel García Ortega' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View all projects' }),
  ).toHaveAttribute('href', '/PORTFOLIO/proyectos/');
  await expect(
    page.getByRole('button', { name: 'View profile' }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Technologies' }),
  ).toHaveCount(0);

  const aboutTrigger = page
    .getByRole('button', { name: 'About', exact: true })
    .first();
  await aboutTrigger.click();
  const aboutDialog = page.getByRole('dialog', {
    name: 'Daniel García Ortega',
  });
  await expect(aboutDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(aboutDialog).toBeHidden();
  await expect(aboutTrigger).toBeFocused();

  await page.getByRole('link', { name: 'View all projects' }).click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/proyectos\/$/);
});

test('los proyectos abren el diálogo correcto y derivan sus CTAs de los datos', async ({
  page,
}) => {
  await page.goto('./');

  for (const title of ['AL-LÍO', 'SIDN Cost Control', 'Feedback2Action']) {
    await page.getByRole('button', { name: `View project ${title}` }).click();
    const dialog = page.getByRole('dialog', { name: title });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.project-dialog__visual img')).toHaveAttribute(
      'src',
      /\/PORTFOLIO\/images\/projects\/.+\.webp$/,
    );
    await expect(
      dialog.locator('.project-dialog__visual'),
    ).not.toHaveJSProperty('tagName', 'A');

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    if (viewport) {
      await expect
        .poll(async () => {
          const dialogBox = await dialog.boundingBox();
          return dialogBox
            ? Math.abs(dialogBox.x + dialogBox.width / 2 - viewport.width / 2)
            : Number.POSITIVE_INFINITY;
        })
        .toBeLessThanOrEqual(2);
      await expect
        .poll(async () => {
          const dialogBox = await dialog.boundingBox();
          return dialogBox
            ? Math.abs(dialogBox.y + dialogBox.height / 2 - viewport.height / 2)
            : Number.POSITIVE_INFINITY;
        })
        .toBeLessThanOrEqual(2);
    }

    if (title === 'AL-LÍO') {
      await expect(
        dialog.getByRole('link', { name: 'Open AL-LÍO demo' }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('link', { name: 'View AL-LÍO code' }),
      ).toBeVisible();
    } else {
      await expect(
        dialog.getByRole('link', { name: `Open ${title} demo` }),
      ).toHaveCount(0);
      await expect(
        dialog.getByRole('link', { name: `View ${title} code` }),
      ).toHaveCount(0);
    }

    await dialog.getByRole('button', { name: `Close ${title}` }).click();
    await expect(dialog).toBeHidden();
  }
});

test('la página de proyectos muestra tres proyectos y no contiene enlaces falsos', async ({
  page,
}) => {
  await page.goto('./proyectos/');

  await expect(page.locator('.project-row')).toHaveCount(3);
  await expect(page.locator('.project-row h2')).toHaveText([
    'AL-LÍO',
    'SIDN Cost Control',
    'Feedback2Action',
  ]);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Proyectos' }),
  ).toBeAttached();
  await expect(page.locator('main')).not.toContainText(
    'Proyectos claros, útiles y construidos con propósito.',
  );
  await expect(page.locator('main')).not.toContainText(
    'Convirtamos una necesidad real en un producto claro.',
  );
  await expect(page.locator('main')).not.toContainText('Ganador');
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  await expect(page.locator('text=PENDING_')).toHaveCount(0);

  await page
    .getByRole('button', { name: 'View project Feedback2Action' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Feedback2Action' }),
  ).toBeVisible();
});

test('el modal de contacto permite copiar el correo y enlaza a LinkedIn y GitHub', async ({
  page,
}) => {
  await page.goto('./');

  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).not.toContainText('Contact');

  const contactTrigger = page.getByRole('button', { name: 'Contact' }).first();
  await contactTrigger.click();
  const contactDialog = page.getByRole('dialog', { name: 'Get in touch.' });
  await expect(contactDialog).toBeVisible();

  await expect(contactDialog).toContainText('dangarort123@gmail.com');
  await expect(
    contactDialog.getByRole('button', { name: 'Copy email' }),
  ).toBeVisible();
  await expect(
    contactDialog.getByRole('link', { name: 'LinkedIn' }),
  ).toHaveAttribute(
    'href',
    'https://linkedin.com/in/daniel-garcía-ortega-404754385/',
  );
  await expect(
    contactDialog.getByRole('link', { name: 'GitHub' }),
  ).toHaveAttribute('href', 'https://github.com/danielgarciaortega-dev');

  await page.keyboard.press('Escape');
  await expect(contactDialog).toBeHidden();
  await expect(contactTrigger).toBeFocused();
});

test('copiar correo en el modal de contacto muestra confirmación visible', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  await page.getByRole('button', { name: 'Contact' }).first().click();
  const status = page.locator('[data-copy-status]');
  await expect(status).toBeEmpty();
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(status).toHaveText(/copied/i);
  await expect(status).toBeVisible();
  const clipboardText = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  expect(clipboardText).toBe('dangarort123@gmail.com');
});

test('el footer muestra enlaces con icono (GitHub, LinkedIn, CV, contacto) sin texto visible', async ({
  page,
}) => {
  await page.goto('./');
  const footer = page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();

  await expect(footer).not.toContainText('2026');
  await expect(footer.locator('svg')).toHaveCount(4);

  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/danielgarciaortega-dev',
  );
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://linkedin.com/in/daniel-garcía-ortega-404754385/',
  );
  await expect(footer.getByRole('link', { name: 'View CV' })).toHaveAttribute(
    'href',
    /\/cv\/$/,
  );

  await footer.getByRole('button', { name: 'Contact' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Get in touch.' }),
  ).toBeVisible();
});

test('la franja profesional muestra logos junto a tecnologías, formación y experiencia', async ({
  page,
}) => {
  await page.goto('./');

  const technologyItems = page.locator('.home-overview__technologies li');
  await expect(technologyItems).toHaveCount(22);
  await expect(technologyItems.locator('img')).toHaveCount(22);
  await expect(
    page.locator('img[src$="/images/education/foc.svg"]'),
  ).toBeVisible();
  await expect(
    page.locator('img[src$="/images/companies/salunox.svg"]'),
  ).toBeVisible();
});

test('el menú móvil abre, cierra con Escape y restaura el foco', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const trigger = page.locator('[data-menu-open]');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();

  const widths = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth);
});

test('el CV carga sus recursos, vuelve al portfolio y conserva la exportación', async ({
  page,
}) => {
  const failedLocalResources: string[] = [];
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.hostname === '127.0.0.1' && response.status() >= 400) {
      failedLocalResources.push(`${response.status()} ${url.pathname}`);
    }
  });

  await page.goto('./cv/');
  await expect(page).toHaveTitle(/CV - Daniel García Ortega/);
  await expect(page.locator('.project-card h3')).toHaveText([
    'AL-LÍO',
    'SIDN Cost Control',
    'Feedback2Action',
  ]);
  const downloadLink = page.getByRole('link', {
    name: 'Descargar CV de Daniel García Ortega en PDF',
  });
  await expect(downloadLink).toBeVisible();
  await expect(downloadLink).toHaveAttribute(
    'href',
    'CV-Daniel-Garcia-Ortega.pdf',
  );
  await expect(downloadLink).toHaveAttribute('download', '');
  await expect(
    page.getByRole('link', {
      name: 'Volver al portfolio de Daniel García Ortega',
    }),
  ).toHaveAttribute('href', '../');

  const pdfResponse = await page.request.get(
    './cv/CV-Daniel-Garcia-Ortega.pdf',
  );
  expect(pdfResponse.ok()).toBe(true);
  expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
  expect(failedLocalResources).toEqual([]);
});

test('no hay desbordamiento horizontal en los breakpoints definidos', async ({
  page,
}) => {
  const viewports = [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('./');
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(
      overflow,
      `${viewport.width}x${viewport.height}`,
    ).toBeLessThanOrEqual(0);
  }
});

test('la portada cabe en una pantalla de ~900px de alto o más', async ({
  page,
}) => {
  // .home-page has a natural (auto) height with a one-screen min-height —
  // it never clips or overlaps content. On viewports around 900px tall or
  // taller, the hero+overview content fits without scrolling; the only
  // extra scroll comes from the site footer below it, which is expected.
  // Shorter windows (e.g. 1024x768, 1280x800 laptops) scroll a bit more,
  // which is normal, expected behavior rather than a layout bug.
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('./');
    const { overflow, footerHeight } = await page.evaluate(() => ({
      overflow: document.documentElement.scrollHeight - window.innerHeight,
      footerHeight:
        document.querySelector('.site-footer')?.getBoundingClientRect()
          .height ?? 0,
    }));
    expect(
      overflow,
      `${viewport.width}x${viewport.height}`,
    ).toBeLessThanOrEqual(footerHeight + 1);
  }
});

test('las rutas principales y activos locales responden sin 404', async ({
  page,
}) => {
  const failures: string[] = [];
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.hostname === '127.0.0.1' && response.status() >= 400) {
      failures.push(`${response.status()} ${url.pathname}`);
    }
  });

  await page.goto('./');
  await page.goto('./proyectos/');
  await page.goto('./cv/');
  expect(failures).toEqual([]);

  const notFoundResponse = await page.goto('./ruta-inexistente/');
  expect(notFoundResponse?.status()).toBe(404);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Esta ruta no forma parte del proyecto.',
    }),
  ).toBeVisible();
});

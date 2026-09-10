import { expect, test } from '@playwright/test';

const origin = 'http://127.0.0.1:4321';

const metadataCases = [
  {
    route: './',
    locale: 'es',
    title: 'Daniel García Ortega · Desarrollador web full-stack',
    description:
      'Portfolio de Daniel García Ortega, desarrollador web full-stack en Granada: proyectos, tecnologías, experiencia, formación y CV.',
    canonical: `${origin}/PORTFOLIO/`,
    ogLocale: 'es_ES',
    ogAlternateLocale: 'en_GB',
    imageAlt: 'Daniel García Ortega, desarrollador web full-stack',
    alternates: {
      es: `${origin}/PORTFOLIO/`,
      en: `${origin}/PORTFOLIO/en/`,
    },
  },
  {
    route: './en/',
    locale: 'en',
    title: 'Daniel García Ortega · Full-stack web developer',
    description:
      'Portfolio of Daniel García Ortega, full-stack web developer in Granada: projects, technologies, experience, education and CV.',
    canonical: `${origin}/PORTFOLIO/en/`,
    ogLocale: 'en_GB',
    ogAlternateLocale: 'es_ES',
    imageAlt: 'Daniel García Ortega, full-stack web developer',
    alternates: {
      es: `${origin}/PORTFOLIO/`,
      en: `${origin}/PORTFOLIO/en/`,
    },
  },
  {
    route: './proyectos/',
    locale: 'es',
    title: 'Proyectos · Daniel García Ortega',
    description:
      'Proyectos seleccionados de Daniel García Ortega: AL-LÍO, SIDN Cost Control y Feedback2Action.',
    canonical: `${origin}/PORTFOLIO/proyectos/`,
    ogLocale: 'es_ES',
    ogAlternateLocale: 'en_GB',
    imageAlt: 'Daniel García Ortega, desarrollador web full-stack',
    alternates: {
      es: `${origin}/PORTFOLIO/proyectos/`,
      en: `${origin}/PORTFOLIO/en/projects/`,
    },
  },
  {
    route: './en/projects/',
    locale: 'en',
    title: 'Projects · Daniel García Ortega',
    description:
      'Selected projects by Daniel García Ortega: AL-LÍO, SIDN Cost Control and Feedback2Action.',
    canonical: `${origin}/PORTFOLIO/en/projects/`,
    ogLocale: 'en_GB',
    ogAlternateLocale: 'es_ES',
    imageAlt: 'Daniel García Ortega, full-stack web developer',
    alternates: {
      es: `${origin}/PORTFOLIO/proyectos/`,
      en: `${origin}/PORTFOLIO/en/projects/`,
    },
  },
] as const;

for (const metadataCase of metadataCases) {
  test(`${metadataCase.locale} ${metadataCase.route} publishes coherent canonical, alternate and social metadata`, async ({
    page,
  }) => {
    const response = await page.goto(metadataCase.route);
    expect(response?.ok()).toBe(true);

    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      metadataCase.locale,
    );
    await expect(page).toHaveTitle(metadataCase.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      metadataCase.description,
    );

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute('href', metadataCase.canonical);

    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      metadataCase.canonical,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      'content',
      metadataCase.ogLocale,
    );
    await expect(
      page.locator('meta[property="og:locale:alternate"]'),
    ).toHaveAttribute('content', metadataCase.ogAlternateLocale);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      metadataCase.title,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute('content', metadataCase.description);
    await expect(
      page.locator('meta[property="og:image:alt"]'),
    ).toHaveAttribute('content', metadataCase.imageAlt);

    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      'content',
      metadataCase.title,
    );
    await expect(
      page.locator('meta[name="twitter:description"]'),
    ).toHaveAttribute('content', metadataCase.description);
    await expect(
      page.locator('meta[name="twitter:image:alt"]'),
    ).toHaveAttribute('content', metadataCase.imageAlt);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      `${origin}/PORTFOLIO/og-image.webp`,
    );

    const alternateLinks = page.locator('link[rel="alternate"][hreflang]');
    await expect(alternateLinks).toHaveCount(2);
    await expect(
      alternateLinks.filter({ has: page.locator(':scope') }).first(),
    ).toBeAttached();
    await expect(
      page.locator('link[rel="alternate"][hreflang="es"]'),
    ).toHaveAttribute('href', metadataCase.alternates.es);
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute('href', metadataCase.alternates.en);
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]'),
    ).toHaveCount(0);
    await expect(
      page.locator(
        `link[rel="alternate"][href="${origin}/PORTFOLIO/projects/"]`,
      ),
    ).toHaveCount(0);

    for (const href of [
      metadataCase.canonical,
      metadataCase.alternates.es,
      metadataCase.alternates.en,
    ]) {
      expect(href.match(/\/PORTFOLIO\//g)).toHaveLength(1);
    }
  });
}

test('standalone CV does not receive a fictional English alternate before CV localization', async ({
  page,
}) => {
  const response = await page.goto('./cv/');
  expect(response?.ok()).toBe(true);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
  await expect(page.locator('link[href*="/en/cv/"]')).toHaveCount(0);
});

test('custom 404 does not invent localized alternates', async ({ page }) => {
  const response = await page.goto('./missing-metadata-route/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
});

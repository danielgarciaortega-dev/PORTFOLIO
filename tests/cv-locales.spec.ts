import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const A4_WIDTH_PX = (210 / 25.4) * 96;
const A4_HEIGHT_PX = (297 / 25.4) * 96;
const A4_TOLERANCE_PX = 2;

async function readRepositoryFile(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

async function collectParity(page: Page) {
  return page.evaluate(() => ({
    projects: Array.from(document.querySelectorAll('.project-card h3')).map(
      (node) => node.textContent?.trim(),
    ),
    projectLinks: Array.from(document.querySelectorAll('.project-card a')).map(
      (node) => node.getAttribute('href'),
    ),
    employers: Array.from(
      document.querySelectorAll('.experience-company h3'),
    ).map((node) => node.textContent?.trim()),
    experienceDates: Array.from(
      document.querySelectorAll('.experience-date time'),
    ).map((node) => node.getAttribute('datetime')),
    educationDates: Array.from(
      document.querySelectorAll('.education-item time'),
    ).map((node) => node.getAttribute('datetime')),
    stack: Array.from(document.querySelectorAll('.stack-group')).map((group) =>
      Array.from(group.querySelectorAll('.chips span')).map((node) =>
        node.textContent?.trim(),
      ),
    ),
    professionalUrls: Array.from(
      document.querySelectorAll('.professional-footer a'),
    ).map((node) => node.getAttribute('href')),
    topology: Array.from(
      document.querySelector('.cv-content')?.children ?? [],
    ).map((element) =>
      [
        'projects-section',
        'experience-section',
        'stack-section',
        'bottom-grid',
      ].find((className) => element.classList.contains(className)),
    ),
    knowsAbout: JSON.parse(
      document.querySelector('script[type="application/ld+json"]')
        ?.textContent ?? '{}',
    ).knowsAbout,
  }));
}

test('Spanish and English static CVs preserve factual and structural parity', async ({
  page,
}) => {
  await page.goto('./cv/');
  const es = await collectParity(page);
  await page.goto('./en/cv/');
  const en = await collectParity(page);

  expect(en.projects).toEqual(es.projects);
  expect(en.projectLinks).toEqual(es.projectLinks);
  expect(en.employers).toEqual(es.employers);
  expect(en.experienceDates).toEqual(es.experienceDates);
  expect(en.educationDates).toEqual(es.educationDates);
  expect(en.stack).toEqual(es.stack);
  expect(en.professionalUrls).toEqual(es.professionalUrls);
  expect(en.topology).toEqual(es.topology);
  expect(en.knowsAbout).toEqual(es.knowsAbout);
  expect(JSON.stringify(en.stack)).not.toContain('Vercel');
  expect(JSON.stringify(en.knowsAbout)).not.toContain('Vercel');
  expect(JSON.stringify(en.stack)).toContain('Prisma');
  expect(JSON.stringify(en.stack)).toContain('Docker');
});

test('CV counterpart navigation is locale-correct, base-safe and persists portfolio.locale', async ({
  page,
}) => {
  await page.goto('./cv/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  const esSwitch = page.locator('[data-locale-link]');
  await expect(esSwitch).toHaveCount(1);
  await expect(esSwitch).toHaveAttribute('href', '../en/cv/');
  await expect(esSwitch).toHaveAttribute('hreflang', 'en');
  await expect(page.locator('.portfolio-back-link')).toHaveAttribute(
    'href',
    '../',
  );
  await esSwitch.click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/cv\/$/);
  expect(
    await page.evaluate(() => localStorage.getItem('portfolio.locale')),
  ).toBe('en');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const enSwitch = page.locator('[data-locale-link]');
  await expect(enSwitch).toHaveCount(1);
  await expect(enSwitch).toHaveAttribute('href', '../../cv/');
  await expect(enSwitch).toHaveAttribute('hreflang', 'es');
  await expect(page.locator('.portfolio-back-link')).toHaveAttribute(
    'href',
    '../',
  );
  await enSwitch.click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/cv\/$/);
  expect(
    await page.evaluate(() => localStorage.getItem('portfolio.locale')),
  ).toBe('es');
});

test('counterpart link remains normal navigation when JavaScript is disabled', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(new URL('cv/', baseURL).href);
  await page.locator('[data-locale-link]').click();
  await expect(page).toHaveURL(/\/PORTFOLIO\/en\/cv\/$/);
  await context.close();
});

test('English CV reuses shared local assets and has no false Spanish PDF control', async ({
  page,
}) => {
  const failedLocal: string[] = [];
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === 'http://127.0.0.1:4321' && response.status() >= 400) {
      failedLocal.push(url.pathname);
    }
  });

  const response = await page.goto('./en/cv/');
  expect(response?.ok()).toBe(true);
  await page.waitForLoadState('networkidle');
  expect(failedLocal).toEqual([]);
  await expect(page.locator('.download-btn')).toHaveCount(0);
  await expect(
    page.locator('a[href*="CV-Daniel-Garcia-Ortega.pdf"]'),
  ).toHaveCount(0);

  const source = await readRepositoryFile('public/en/cv/index.html');
  expect(source).toContain('href="../../cv/styles.css"');
  expect(source).toContain('href="../../cv/locale-controls.css"');
  expect(source).toContain('src="../../cv/locale.js"');
  expect(source).toContain('src="../../cv/FOTO CARNET.jpg"');
  expect(source).not.toContain('CV-Daniel-Garcia-Ortega.pdf');
});

test('English CV preserves A4, mobile and accessibility geometry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('./en/cv/');
  const sheet = page.locator('.cv-sheet');
  const box = await sheet.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs((box?.width ?? 0) - A4_WIDTH_PX)).toBeLessThanOrEqual(
    A4_TOLERANCE_PX,
  );
  expect(Math.abs((box?.height ?? 0) - A4_HEIGHT_PX)).toBeLessThanOrEqual(
    A4_TOLERANCE_PX,
  );

  const overflow = await sheet.evaluate((element) => ({
    clientWidth: element.clientWidth,
    clientHeight: element.clientHeight,
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight + 1);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.cv-locale-link')).toHaveCSS('display', 'none');
  await page.emulateMedia({ media: 'screen' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const mobile = await page.evaluate(() => ({
    sheetWidth:
      document.querySelector<HTMLElement>('.cv-sheet')?.getBoundingClientRect()
        .width ?? 0,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    footerPosition: getComputedStyle(
      document.querySelector<HTMLElement>('.professional-footer')!,
    ).position,
  }));
  expect(mobile.sheetWidth).toBeLessThanOrEqual(391);
  expect(mobile.scrollWidth).toBeLessThanOrEqual(mobile.clientWidth);
  expect(mobile.footerPosition).toBe('static');
  await expect(page.locator('.cv-locale-link')).toBeVisible();
});

test('English CV contains translated recruiter-facing copy without factual drift', async ({
  page,
}) => {
  await page.goto('./en/cv/');
  await expect(page.locator('.role')).toHaveText('FULL-STACK WEB DEVELOPER');
  await expect(
    page.getByRole('heading', { level: 2, name: /Featured projects/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: /Professional experience/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: /Technical stack/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: /Education/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: /Languages/ }),
  ).toBeVisible();
  await expect(page.getByText('Recognized disability: 34%')).toBeVisible();
  await expect(page.getByText(/22,376 reviews/)).toBeVisible();
  await expect(page.locator('body')).toContainText('409 issue groups');
  await expect(page.locator('body')).toContainText('108 prioritized actions');
});

test('English portfolio shell points its CV action to the English static CV', async ({
  page,
}) => {
  await page.goto('./en/');
  expect(await page.locator('a[href$="/en/cv/"]').count()).toBeGreaterThan(0);
});

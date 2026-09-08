import { expect, test, type Locator, type Page } from '@playwright/test';

interface LogoGeometry {
  mark: number;
  projectArtwork: number;
  overviewArtwork: number;
}

const desktopGeometry: LogoGeometry = {
  mark: 64,
  projectArtwork: 52,
  overviewArtwork: 46,
};

const compactGeometry: LogoGeometry = {
  mark: 44,
  projectArtwork: 34,
  overviewArtwork: 30,
};

async function expectAllSquare(locator: Locator, size: number) {
  const count = await locator.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index);
    await expect(item).toHaveCSS('width', `${size}px`);
    await expect(item).toHaveCSS('height', `${size}px`);
  }
}

async function expectHomeLogoGeometry(page: Page, geometry: LogoGeometry) {
  const projectMarks = page.locator(
    '.hero__projects .project-preview__mark',
  );
  const projectLogos = projectMarks.locator('img');
  const overviewMarks = page.locator(
    '.overview-organization .project-preview__mark',
  );
  const overviewLogos = overviewMarks.locator('img');

  await expectAllSquare(projectMarks, geometry.mark);
  await expectAllSquare(overviewMarks, geometry.mark);
  await expectAllSquare(projectLogos, geometry.projectArtwork);
  await expectAllSquare(overviewLogos, geometry.overviewArtwork);
}

test.describe('geometría de logos de la home', () => {
  test('desktop mantiene la caja compartida y aumenta solo el artwork de proyectos', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('./');

    await expectHomeLogoGeometry(page, desktopGeometry);
  });

  test('compact mantiene la caja compartida y la diferencia óptica prevista', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('./');

    await expectHomeLogoGeometry(page, compactGeometry);
  });
});

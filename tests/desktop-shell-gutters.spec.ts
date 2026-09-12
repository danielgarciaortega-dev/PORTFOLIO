import { expect, test, type Page } from '@playwright/test';

const localeCases = [
  { route: './', navigation: 'Navegación principal' },
  { route: './en/', navigation: 'Main navigation' },
] as const;

const alignedWidths = [1280, 1440, 1536, 1920] as const;
const compactWidths = [1024, 1100, 1180] as const;

async function expectNoHorizontalOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, context).toBeLessThanOrEqual(0);
}

test('desktop header and home content share deliberate gutters with centered navigation', async ({
  page,
}) => {
  for (const localeCase of localeCases) {
    for (const width of alignedWidths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(localeCase.route);

      const header = page.locator('[data-site-header]');
      const brand = header.locator('.brand');
      const navigation = header.getByRole('navigation', {
        name: localeCase.navigation,
      });
      const actions = header.locator('.site-header__actions');
      const heroGrid = page.locator('.home-page .hero__grid');
      const heroPortrait = page.locator('.hero__portrait');
      const overviewTechnologies = page.locator(
        '.home-overview__technologies',
      );

      const [brandBox, navigationBox, actionsBox, heroGridBox, portraitBox] =
        await Promise.all([
          brand.boundingBox(),
          navigation.boundingBox(),
          actions.boundingBox(),
          heroGrid.boundingBox(),
          heroPortrait.boundingBox(),
        ]);
      const overviewBox = await overviewTechnologies.boundingBox();

      expect(brandBox).not.toBeNull();
      expect(navigationBox).not.toBeNull();
      expect(actionsBox).not.toBeNull();
      expect(heroGridBox).not.toBeNull();
      expect(portraitBox).not.toBeNull();
      expect(overviewBox).not.toBeNull();

      expect(Math.abs((brandBox?.x ?? 0) - (portraitBox?.x ?? 0))).toBeLessThanOrEqual(1);
      expect(Math.abs((brandBox?.x ?? 0) - (overviewBox?.x ?? 0))).toBeLessThanOrEqual(1);

      const heroContentRight = await heroGrid.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const paddingRight = Number.parseFloat(getComputedStyle(element).paddingRight);
        return rect.right - paddingRight;
      });
      const actionsRight =
        (actionsBox?.x ?? 0) + (actionsBox?.width ?? 0);
      expect(Math.abs(actionsRight - heroContentRight)).toBeLessThanOrEqual(1);

      const navigationCenter =
        (navigationBox?.x ?? 0) + (navigationBox?.width ?? 0) / 2;
      expect(Math.abs(navigationCenter - width / 2)).toBeLessThanOrEqual(1);

      await expect(header).toHaveCSS('position', 'sticky');
      await expectNoHorizontalOverflow(
        page,
        `${localeCase.route} aligned desktop ${width}px`,
      );
    }
  }
});

test('compact desktop header clusters do not collide or overflow', async ({
  page,
}) => {
  for (const localeCase of localeCases) {
    for (const width of compactWidths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(localeCase.route);

      const header = page.locator('[data-site-header]');
      const left = header.locator('.site-header__left');
      const navigation = header.getByRole('navigation', {
        name: localeCase.navigation,
      });
      const actions = header.locator('.site-header__actions');

      const [leftBox, navigationBox, actionsBox] = await Promise.all([
        left.boundingBox(),
        navigation.boundingBox(),
        actions.boundingBox(),
      ]);

      expect(leftBox).not.toBeNull();
      expect(navigationBox).not.toBeNull();
      expect(actionsBox).not.toBeNull();

      const leftRight = (leftBox?.x ?? 0) + (leftBox?.width ?? 0);
      const navigationRight =
        (navigationBox?.x ?? 0) + (navigationBox?.width ?? 0);

      expect(leftRight).toBeLessThanOrEqual((navigationBox?.x ?? 0) + 1);
      expect(navigationRight).toBeLessThanOrEqual((actionsBox?.x ?? 0) + 1);

      await expectNoHorizontalOverflow(
        page,
        `${localeCase.route} compact desktop ${width}px`,
      );
    }
  }
});

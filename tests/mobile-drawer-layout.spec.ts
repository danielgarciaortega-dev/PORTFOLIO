import { expect, test, type Page } from '@playwright/test';

const localeCases = [
  {
    route: './',
    menu: 'Navegación',
    navigation: 'Navegación móvil',
    open: 'Abrir menú',
    close: 'Cerrar menú',
  },
  {
    route: './en/',
    menu: 'Navigation',
    navigation: 'Mobile navigation',
    open: 'Open menu',
    close: 'Close menu',
  },
] as const;

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
] as const;

async function expectNoHorizontalOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, context).toBeLessThanOrEqual(0);
}

test('mobile drawer keeps deliberate rhythm and reachable controls', async ({
  page,
}) => {
  for (const localeCase of localeCases) {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(localeCase.route);

      const trigger = page.locator('[data-menu-open]');
      await expect(trigger).toHaveAttribute('aria-label', localeCase.open);
      await trigger.click();

      const menu = page.getByRole('dialog', { name: localeCase.menu });
      const panel = menu.locator('.mobile-menu__panel');
      const head = menu.locator('.mobile-menu__head');
      const navigation = menu.getByRole('navigation', {
        name: localeCase.navigation,
      });
      const utilities = menu.locator('[data-mobile-utilities]');

      await expect(menu).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(trigger).toHaveAttribute('aria-label', localeCase.close);
      await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
      await expect(panel).toHaveCSS('overflow-y', 'auto');

      const boxes = await Promise.all([
        menu.boundingBox(),
        head.boundingBox(),
        navigation.boundingBox(),
        utilities.boundingBox(),
      ]);
      const [menuBox, headBox, navigationBox, utilitiesBox] = boxes;

      expect(menuBox).not.toBeNull();
      expect(headBox).not.toBeNull();
      expect(navigationBox).not.toBeNull();
      expect(utilitiesBox).not.toBeNull();

      const menuRight = (menuBox?.x ?? 0) + (menuBox?.width ?? 0);
      expect(menuBox?.x ?? 0).toBeGreaterThanOrEqual(-1);
      expect(menuRight).toBeLessThanOrEqual(viewport.width + 1);
      expect(menuBox?.height ?? 0).toBeLessThanOrEqual(viewport.height + 1);

      const headBottom = (headBox?.y ?? 0) + (headBox?.height ?? 0);
      const navigationBottom =
        (navigationBox?.y ?? 0) + (navigationBox?.height ?? 0);
      const headingGap = (navigationBox?.y ?? 0) - headBottom;
      const utilitiesGap = (utilitiesBox?.y ?? 0) - navigationBottom;

      expect(headingGap).toBeGreaterThanOrEqual(8);
      expect(headingGap).toBeLessThanOrEqual(32);
      expect(utilitiesGap).toBeGreaterThanOrEqual(8);
      expect(utilitiesGap).toBeLessThanOrEqual(32);

      const targets = menu.locator('a, button');
      const targetCount = await targets.count();
      for (let index = 0; index < targetCount; index += 1) {
        const box = await targets.nth(index).boundingBox();
        expect(box).not.toBeNull();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }

      const cvLink = menu.locator('.mobile-menu__cv');
      await cvLink.scrollIntoViewIfNeeded();
      const cvBox = await cvLink.boundingBox();
      const cvBottom = (cvBox?.y ?? 0) + (cvBox?.height ?? 0);
      expect(cvBox).not.toBeNull();
      expect(cvBox?.y ?? -1).toBeGreaterThanOrEqual(-1);
      expect(cvBottom).toBeLessThanOrEqual(viewport.height + 1);

      if (viewport.width === 844 && viewport.height === 390) {
        const scrollGeometry = await panel.evaluate((element) => ({
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight,
        }));
        const { clientHeight, scrollHeight } = scrollGeometry;
        expect(scrollHeight).toBeGreaterThan(clientHeight);
      }

      const context = `${localeCase.route} ${viewport.width}x${viewport.height}`;
      await expectNoHorizontalOverflow(page, context);

      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).toHaveAttribute('aria-label', localeCase.open);
      await expect(trigger).toBeFocused();
    }
  }
});

test('mobile drawer preserves close and backdrop dismissal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  const trigger = page.locator('[data-menu-open]');
  const menu = page.getByRole('dialog', { name: 'Navegación' });

  await expect(trigger).toHaveAttribute('aria-label', 'Abrir menú');
  await trigger.click();
  await menu.getByRole('button', { name: 'Cerrar menú' }).click();
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  const menuBox = await menu.boundingBox();
  expect(menuBox).not.toBeNull();
  expect(menuBox?.x ?? 0).toBeGreaterThan(1);
  await page.mouse.click((menuBox?.x ?? 2) / 2, 12);
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

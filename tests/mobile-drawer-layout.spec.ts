import { expect, test, type Locator, type Page } from '@playwright/test';

const localeCases = [
  {
    route: './',
    menu: 'Navegación',
    navigation: 'Navegación móvil',
    open: 'Abrir menú',
    close: 'Cerrar menú',
    cv: 'Consultar CV',
    cvHref: '/PORTFOLIO/cv/opciones/',
  },
  {
    route: './en/',
    menu: 'Navigation',
    navigation: 'Mobile navigation',
    open: 'Open menu',
    close: 'Close menu',
    cv: 'View CV',
    cvHref: '/PORTFOLIO/en/cv/options/',
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

async function waitForDrawerMotion(menu: Locator) {
  await menu.evaluate(async (element) => {
    await Promise.allSettled(
      element.getAnimations().map((animation) => animation.finished),
    );
  });
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
      const footer = page.locator('[data-mobile-utility-footer]');

      await expect(menu).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(trigger).toHaveAttribute('aria-label', localeCase.close);
      await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
      await expect(panel).toHaveCSS('overflow-y', 'auto');
      await waitForDrawerMotion(menu);

      await expect(menu.locator('[data-mobile-utilities]')).toHaveCount(0);
      await expect(menu.locator('[data-language-switcher]')).toHaveCount(0);
      await expect(navigation.getByRole('link')).toHaveCount(3);

      const boxes = await Promise.all([
        menu.boundingBox(),
        head.boundingBox(),
        navigation.boundingBox(),
      ]);
      const [menuBox, headBox, navigationBox] = boxes;

      expect(menuBox).not.toBeNull();
      expect(headBox).not.toBeNull();
      expect(navigationBox).not.toBeNull();

      const menuRight = (menuBox?.x ?? 0) + (menuBox?.width ?? 0);
      expect(menuBox?.x ?? 0).toBeGreaterThanOrEqual(-1);
      expect(menuRight).toBeLessThanOrEqual(viewport.width + 1);
      expect(menuBox?.height ?? 0).toBeLessThanOrEqual(viewport.height + 1);

      const headBottom = (headBox?.y ?? 0) + (headBox?.height ?? 0);
      const navigationTop = navigationBox?.y ?? 0;

      expect(navigationTop - headBottom).toBeGreaterThanOrEqual(8);

      const targets = menu.locator('a, button');
      const targetCount = await targets.count();
      for (let index = 0; index < targetCount; index += 1) {
        const box = await targets.nth(index).boundingBox();
        expect(box).not.toBeNull();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }

      if (viewport.width === 844 && viewport.height === 390) {
        const scrollGeometry = await panel.evaluate((element) => ({
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight,
        }));
        expect(scrollGeometry.scrollHeight).toBeGreaterThanOrEqual(
          scrollGeometry.clientHeight,
        );
      }

      const context = `${localeCase.route} ${viewport.width}x${viewport.height}`;
      await expectNoHorizontalOverflow(page, context);

      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).toHaveAttribute('aria-label', localeCase.open);
      await expect(trigger).toBeFocused();

      await expect(footer).toBeVisible();
      await expect(footer.locator('[data-footer-socials] a')).toHaveCount(2);
      const cvLink = footer.getByRole('link', { name: localeCase.cv });
      await expect(cvLink).toHaveAttribute('href', localeCase.cvHref);
      await cvLink.scrollIntoViewIfNeeded();
      const cvBox = await cvLink.boundingBox();
      expect(cvBox).not.toBeNull();
      expect(cvBox?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(cvBox?.y ?? -1).toBeGreaterThanOrEqual(-1);
      expect((cvBox?.y ?? 0) + (cvBox?.height ?? 0)).toBeLessThanOrEqual(
        viewport.height + 1,
      );
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
  await waitForDrawerMotion(menu);
  const menuBox = await menu.boundingBox();
  expect(menuBox).not.toBeNull();
  expect(menuBox?.x ?? 0).toBeGreaterThan(1);
  await page.mouse.click((menuBox?.x ?? 2) / 2, 12);
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

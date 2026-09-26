import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1024, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

const locales = [
  {
    route: './proyectos/',
    actionPrefix: 'Ver proyecto',
    dialogClose: 'Cerrar AL-LÍO',
  },
  {
    route: './en/projects/',
    actionPrefix: 'View project',
    dialogClose: 'Close AL-LÍO',
  },
] as const;

for (const viewport of viewports) {
  test(`projects QA at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);

    for (const locale of locales) {
      await page.goto(locale.route);

      const rows = page.locator('.project-row');
      const moments = page.locator('.projects-page__backdrop img');

      await expect(rows).toHaveCount(3);
      await expect(moments).toHaveCount(6);
      await expect(page.locator('.project-row__visual img')).toHaveCount(3);

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);

      const rowGeometry = await rows.evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return {
            left: box.left,
            right: box.right,
            width: box.width,
          };
        }),
      );

      for (const box of rowGeometry) {
        expect(box.left).toBeGreaterThanOrEqual(-1);
        expect(box.right).toBeLessThanOrEqual(viewport.width + 1);
        expect(box.width).toBeGreaterThan(0);
      }

      const projectImages = page.locator('.project-row__visual img');
      for (let index = 0; index < 3; index += 1) {
        const image = projectImages.nth(index);
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate(
              (element) =>
                element instanceof HTMLImageElement &&
                element.complete &&
                element.naturalWidth > 0,
            ),
          )
          .toBe(true);
      }

      const firstAction = page.getByRole('button', {
        name: `${locale.actionPrefix} AL-LÍO`,
      });
      await firstAction.focus();
      await expect(firstAction).toBeFocused();
      await expect(firstAction).toHaveCSS('outline-style', 'solid');

      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: 'AL-LÍO' });
      await expect(dialog).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(firstAction).toBeFocused();

      const secondAction = page.getByRole('button', {
        name: `${locale.actionPrefix} SIDN Cost Control`,
      });
      await secondAction.hover();
      await expect(secondAction).toHaveCSS(
        'border-bottom-color',
        'rgb(231, 99, 54)',
      );
    }
  });
}

test('backdrop states keep project layout stable', async ({ page }) => {
    for (const locale of locales) {
      for (const viewport of [
        { width: 1440, height: 900 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(viewport);
        await page.goto(locale.route);

        const moments = page.locator('.projects-page__backdrop img');
        await expect(moments).toHaveCount(6);

        await moments.evaluateAll(async (images) => {
          await Promise.all(
            images.map(async (image) => {
              if (image instanceof HTMLImageElement && !image.complete) {
                await image.decode();
              }
              (image as HTMLElement).style.animation = 'none';
              (image as HTMLElement).style.opacity = '0';
              (image as HTMLElement).style.filter = 'none';
              (image as HTMLElement).style.transform = 'none';
            }),
          );
        });

        const content = page.locator('.projects-page-list--solo');
        const baseline = await content.boundingBox();
        expect(baseline).not.toBeNull();

        for (let index = 0; index < 6; index += 1) {
          await moments.evaluateAll((images, activeIndex) => {
            images.forEach((image, imageIndex) => {
              (image as HTMLElement).style.opacity =
                imageIndex === activeIndex ? '1' : '0';
            });
          }, index);

          const active = moments.nth(index);
          await expect(active).toBeVisible();

          const loaded = await active.evaluate(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          );
          expect(loaded).toBe(true);

          const current = await content.boundingBox();
          expect(current).not.toBeNull();
          if (baseline && current) {
            expect(current.x).toBeCloseTo(baseline.x, 3);
            expect(current.y).toBeCloseTo(baseline.y, 3);
            expect(current.width).toBeCloseTo(baseline.width, 3);
            expect(current.height).toBeCloseTo(baseline.height, 3);
          }

          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          );
          expect(overflow).toBeLessThanOrEqual(0);
        }
      }
    }
});

test('reduced motion keeps project layout stable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    for (const locale of locales) {
      for (const viewport of [
        { width: 1440, height: 900 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(viewport);
        await page.goto(locale.route);

        const moments = page.locator('.projects-page__backdrop img');
        const states = await moments.evaluateAll((images) =>
          images.map((image) => {
            const style = getComputedStyle(image);
            return {
              animation: style.animationName,
              opacity: style.opacity,
              filter: style.filter,
              transform: style.transform,
            };
          }),
        );

        expect(states[0]).toEqual({
          animation: 'none',
          opacity: '1',
          filter: 'none',
          transform: 'none',
        });
        expect(
          states.slice(1).every(
            (state) =>
              state.animation === 'none' &&
              state.opacity === '0' &&
              state.filter === 'none' &&
              state.transform === 'none',
          ),
        ).toBe(true);

        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      }
    }
});

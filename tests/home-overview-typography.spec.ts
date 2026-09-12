import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

async function expectOverviewTypographyAndGeometry(page: Page, route: string) {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(route);

    const overview = page.locator('.home-overview');
    const technologyHeading = overview
      .locator('.technology-group__label')
      .first();
    const factHeading = overview.locator('.home-overview__fact h2').first();

    await expect(overview).toBeVisible();
    await expect(technologyHeading).toBeVisible();
    await expect(factHeading).toBeVisible();

    const technologyStyle = await technologyHeading.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    });
    const factStyle = await factHeading.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: style.fontWeight,
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    });

    expect(technologyStyle.fontSize).toBeGreaterThanOrEqual(13.5);
    expect(technologyStyle.fontSize).toBeCloseTo(factStyle.fontSize, 1);
    expect(technologyStyle.fontWeight).toBe(factStyle.fontWeight);
    expect(technologyStyle.lineHeight).toBeCloseTo(factStyle.lineHeight, 1);

    const pageOverflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(pageOverflows).toBe(false);

    const overviewBox = await overview.boundingBox();
    expect(overviewBox).not.toBeNull();

    const textBoxes = await overview
      .locator('.technology-group__label, .home-overview__technologies li span')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right, width: rect.width };
        }),
      );

    for (const box of textBoxes) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.left).toBeGreaterThanOrEqual((overviewBox?.x ?? 0) - 1);
      expect(box.right).toBeLessThanOrEqual(
        (overviewBox?.x ?? 0) + (overviewBox?.width ?? viewport.width) + 1,
      );
    }
  }
}

test.describe('professional overview typography and geometry', () => {
  test(
    'Spanish keeps a coherent heading scale without overflow',
    async ({ page }) => {
      await expectOverviewTypographyAndGeometry(page, './');
    },
  );

  test(
    'English keeps the same heading scale without overflow',
    async ({ page }) => {
      await expectOverviewTypographyAndGeometry(page, './en/');
    },
  );
});

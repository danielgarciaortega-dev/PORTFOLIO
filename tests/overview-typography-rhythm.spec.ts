import { expect, test } from '@playwright/test';

const localeRoutes = ['./', './en/'];
const responsiveWidths = [768, 1024, 1280, 1440, 1920];

test('professional overview uses one deliberate typography hierarchy', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./');

  const subgroupLabel = page.locator('.technology-group__label').first();
  const technology = page.locator('.home-overview__technologies li').first();
  const factHeading = page.locator('.home-overview__fact h2').first();

  await expect(subgroupLabel).toHaveCSS('font-size', '12px');
  await expect(subgroupLabel).toHaveCSS('font-weight', '760');
  await expect(subgroupLabel).toHaveCSS('line-height', '15px');
  await expect(technology).toHaveCSS('font-size', '11.84px');
  await expect(technology).toHaveCSS('line-height', '15.984px');
  await expect(factHeading).toHaveCSS('font-size', '13.76px');
  await expect(factHeading).toHaveCSS('font-weight', '740');
  await expect(factHeading).toHaveCSS('line-height', '17.2px');

  const scale = await page.evaluate(() => {
    const subgroup = document.querySelector<HTMLElement>(
      '.technology-group__label',
    );
    const heading = document.querySelector<HTMLElement>(
      '.home-overview__fact h2',
    );
    if (!subgroup || !heading) throw new Error('Overview typography missing');

    return {
      subgroup: Number.parseFloat(getComputedStyle(subgroup).fontSize),
      heading: Number.parseFloat(getComputedStyle(heading).fontSize),
    };
  });

  expect(scale.subgroup / scale.heading).toBeGreaterThanOrEqual(0.85);
});

for (const route of localeRoutes) {
  test(`professional overview stays balanced and overflow-free across widths: ${route}`, async ({
    page,
  }) => {
    for (const width of responsiveWidths) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route);

      const result = await page.evaluate(() => {
        const overview = document.querySelector<HTMLElement>('.home-overview');
        const technologies = document.querySelector<HTMLElement>(
          '.home-overview__technologies',
        );
        const groups = document.querySelector<HTMLElement>('.technology-groups');
        const technologyItems = [
          ...document.querySelectorAll<HTMLElement>(
            '.home-overview__technologies li',
          ),
        ];

        if (!overview || !technologies || !groups) {
          throw new Error('Professional overview missing');
        }

        const overviewBox = overview.getBoundingClientRect();
        const technologiesBox = technologies.getBoundingClientRect();
        const groupsBox = groups.getBoundingClientRect();

        return {
          documentFits:
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
          overviewFitsViewport:
            overviewBox.left >= -1 && overviewBox.right <= innerWidth + 1,
          groupsFitColumn:
            groupsBox.left >= technologiesBox.left - 1 &&
            groupsBox.right <= technologiesBox.right + 1,
          itemOverflows: technologyItems.some(
            (item) => item.scrollWidth > item.clientWidth + 1,
          ),
        };
      });

      expect(result.documentFits, `${route} at ${width}px`).toBe(true);
      expect(result.overviewFitsViewport, `${route} at ${width}px`).toBe(true);
      expect(result.groupsFitColumn, `${route} at ${width}px`).toBe(true);
      expect(result.itemOverflows, `${route} at ${width}px`).toBe(false);
    }
  });
}

import { expect, test } from '@playwright/test';

test('formación y experiencia comparten la geometría visual de los logos de proyectos', async ({
  page,
}) => {
  const projectMark = page
    .locator('.hero__projects .project-preview__mark')
    .first();
  const projectLogo = projectMark.locator('img');
  const overviewMark = page
    .locator('.overview-organization .project-preview__mark')
    .first();
  const overviewLogo = overviewMark.locator('img');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./');

  await expect(projectMark).toHaveCSS('width', '64px');
  await expect(projectMark).toHaveCSS('height', '64px');
  await expect(projectLogo).toHaveCSS('width', '46px');
  await expect(projectLogo).toHaveCSS('height', '46px');
  await expect(overviewMark).toHaveCSS('width', '64px');
  await expect(overviewMark).toHaveCSS('height', '64px');
  await expect(overviewLogo).toHaveCSS('width', '46px');
  await expect(overviewLogo).toHaveCSS('height', '46px');

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('./');

  await expect(projectMark).toHaveCSS('width', '44px');
  await expect(projectMark).toHaveCSS('height', '44px');
  await expect(projectLogo).toHaveCSS('width', '30px');
  await expect(projectLogo).toHaveCSS('height', '30px');
  await expect(overviewMark).toHaveCSS('width', '44px');
  await expect(overviewMark).toHaveCSS('height', '44px');
  await expect(overviewLogo).toHaveCSS('width', '30px');
  await expect(overviewLogo).toHaveCSS('height', '30px');
});

import { expect, test, type Locator, type Page } from '@playwright/test';

const localeCases = [
  { route: './', label: 'es' },
  { route: './en/', label: 'en' },
] as const;

const narrowViewports = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

async function expectNoHorizontalOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow, context).toBeLessThanOrEqual(0);
}

async function box(locator: Locator) {
  const result = await locator.boundingBox();
  expect(result).not.toBeNull();
  return result!;
}

test('narrow home stacks intro, portrait, projects and overview deliberately', async ({
  page,
}) => {
  for (const localeCase of localeCases) {
    for (const viewport of narrowViewports) {
      await page.setViewportSize(viewport);
      await page.goto(localeCase.route);

      const intro = page.locator('.home-page .hero__intro');
      const portrait = page.locator('.home-page .hero__portrait');
      const projects = page.locator('.home-page .hero__projects');
      const [introBox, portraitBox, projectsBox] = await Promise.all([
        box(intro),
        box(portrait),
        box(projects),
      ]);

      expect(introBox.y).toBeLessThan(portraitBox.y);
      expect(portraitBox.y).toBeLessThan(projectsBox.y);

      const actions = page.locator('.home-page .hero__actions .button-link');
      const actionCount = await actions.count();
      expect(actionCount).toBeGreaterThan(0);
      for (let index = 0; index < actionCount; index += 1) {
        const action = actions.nth(index);
        const actionBox = await box(action);
        expect(actionBox.height).toBeGreaterThanOrEqual(44);
        await expect(action).toHaveCSS('white-space', 'nowrap');
      }

      const projectButtons = page.locator(
        '.home-page .project-preview__button',
      );
      const projectCount = await projectButtons.count();
      expect(projectCount).toBeGreaterThanOrEqual(3);
      for (let index = 0; index < projectCount; index += 1) {
        const button = projectButtons.nth(index);
        const buttonBox = await box(button);
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);

        const summary = button.locator('.project-preview__body > span');
        await expect(summary).toHaveCSS('white-space', 'normal');
        const summaryFits = await summary.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1,
        );
        expect(summaryFits).toBe(true);
      }

      const technologyGroups = page.locator('.home-overview .technology-group');
      const groupCount = await technologyGroups.count();
      expect(groupCount).toBeGreaterThan(1);
      const groupBoxes = [];
      for (let index = 0; index < groupCount; index += 1) {
        groupBoxes.push(await box(technologyGroups.nth(index)));
      }
      for (let index = 1; index < groupBoxes.length; index += 1) {
        expect(
          Math.abs(groupBoxes[index].x - groupBoxes[0].x),
        ).toBeLessThanOrEqual(1);
        expect(groupBoxes[index].y).toBeGreaterThan(groupBoxes[index - 1].y);
      }

      const overviewSections = page.locator('.home-overview__inner > *');
      await expect(overviewSections).toHaveCount(3);
      const technologyBox = await box(overviewSections.nth(0));
      const educationBox = await box(overviewSections.nth(1));
      const experienceBox = await box(overviewSections.nth(2));
      expect(technologyBox.y).toBeLessThan(educationBox.y);
      expect(educationBox.y).toBeLessThan(experienceBox.y);

      await expectNoHorizontalOverflow(
        page,
        `${localeCase.label} ${viewport.width}x${viewport.height}`,
      );
    }
  }
});

test('tablet home keeps readable projects and a two-column overview without clipping', async ({
  page,
}) => {
  for (const localeCase of localeCases) {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(localeCase.route);

    const portraitBox = await box(page.locator('.home-page .hero__portrait'));
    const introBox = await box(page.locator('.home-page .hero__intro'));
    const projectsBox = await box(page.locator('.home-page .hero__projects'));

    expect(Math.abs(portraitBox.y - introBox.y)).toBeLessThanOrEqual(120);
    expect(projectsBox.y).toBeGreaterThan(
      Math.min(
        portraitBox.y + portraitBox.height,
        introBox.y + introBox.height,
      ),
    );

    const projectButtons = page.locator('.home-page .project-preview__button');
    await expect(projectButtons).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const button = projectButtons.nth(index);
      const buttonBox = await box(button);
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      await expect(button.locator('.project-preview__body > span')).toHaveCSS(
        'white-space',
        'normal',
      );
    }

    const groups = page.locator('.home-overview .technology-group');
    const firstBox = await box(groups.nth(0));
    const secondBox = await box(groups.nth(1));
    const thirdBox = await box(groups.nth(2));
    expect(Math.abs(secondBox.y - thirdBox.y)).toBeLessThanOrEqual(2);
    expect(secondBox.y).toBeGreaterThan(firstBox.y);

    await expectNoHorizontalOverflow(page, `${localeCase.label} 768x1024`);
  }
});

test('home breakpoint transitions remain collision-free around 720 and 900', async ({
  page,
}) => {
  const widths = [719, 720, 721, 899, 900, 901, 1024] as const;

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');

    const introBox = await box(page.locator('.home-page .hero__intro'));
    const portraitBox = await box(page.locator('.home-page .hero__portrait'));
    const projectsBox = await box(page.locator('.home-page .hero__projects'));

    if (width <= 720) {
      expect(introBox.y).toBeLessThan(portraitBox.y);
      expect(portraitBox.y).toBeLessThan(projectsBox.y);
    } else if (width <= 900) {
      expect(Math.abs(introBox.y - portraitBox.y)).toBeLessThanOrEqual(120);
      expect(projectsBox.y).toBeGreaterThan(
        Math.min(
          introBox.y + introBox.height,
          portraitBox.y + portraitBox.height,
        ),
      );
    } else {
      expect(Math.abs(projectsBox.y - introBox.y)).toBeLessThanOrEqual(160);
      expect(Math.abs(introBox.y - portraitBox.y)).toBeLessThanOrEqual(160);
    }

    await expectNoHorizontalOverflow(page, `breakpoint ${width}px`);
  }
});

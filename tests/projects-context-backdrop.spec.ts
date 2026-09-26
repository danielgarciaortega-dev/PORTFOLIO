import { expect, test } from '@playwright/test';

const localeCases = [
  {
    route: './proyectos/',
    projects: [
      { id: 'al-lio', action: 'Ver proyecto AL-LÍO', asset: 'al-lio.webp' },
      {
        id: 'sidn-cost-control',
        action: 'Ver proyecto SIDN Cost Control',
        asset: 'sidn-cost-control.webp',
      },
      {
        id: 'feedback2action',
        action: 'Ver proyecto Feedback2Action',
        asset: 'feedback2action.webp',
      },
    ],
  },
  {
    route: './en/projects/',
    projects: [
      { id: 'al-lio', action: 'View project AL-LÍO', asset: 'al-lio.webp' },
      {
        id: 'sidn-cost-control',
        action: 'View project SIDN Cost Control',
        asset: 'sidn-cost-control.webp',
      },
      {
        id: 'feedback2action',
        action: 'View project Feedback2Action',
        asset: 'feedback2action.webp',
      },
    ],
  },
] as const;

test('project hover and focus select canonical contextual artwork', async ({
  page,
}) => {
  for (const locale of localeCases) {
    await page.goto(locale.route);

    const backdrop = page.locator('.projects-page__backdrop');
    const moments = page.locator('.projects-page__moment');
    const contexts = page.locator('.projects-page__context-image');

    await expect(moments).toHaveCount(6);
    await expect(contexts).toHaveCount(3);
    await expect(backdrop).not.toHaveAttribute('data-active-project');

    for (const project of locale.projects) {
      const row = page.locator(
        `[data-project-context="${project.id}"]`,
      );
      const context = page.locator(
        `[data-project-context-image="${project.id}"]`,
      );

      await expect(context).toHaveAttribute(
        'src',
        new RegExp(`/PORTFOLIO/images/projects/${project.asset}$`),
      );

      await row.hover();
      await expect(backdrop).toHaveAttribute(
        'data-active-project',
        project.id,
      );
      await expect(context).toHaveAttribute('data-active', '');
      await expect(page.locator('.projects-page__moments')).toHaveCSS(
        'opacity',
        '0',
      );

      await page.mouse.move(0, 0);
      await expect(backdrop).not.toHaveAttribute('data-active-project');

      const action = page.getByRole('button', { name: project.action });
      await action.focus();
      await expect(action).toBeFocused();
      await expect(backdrop).toHaveAttribute(
        'data-active-project',
        project.id,
      );
      await expect(context).toHaveAttribute('data-active', '');

      await action.evaluate((element) => (element as HTMLElement).blur());
      await expect(backdrop).not.toHaveAttribute('data-active-project');
    }
  }
});

test('keyboard context wins over incidental pointer hover', async ({ page }) => {
  await page.goto('./proyectos/');

  const backdrop = page.locator('.projects-page__backdrop');
  const sidnAction = page.getByRole('button', {
    name: 'Ver proyecto SIDN Cost Control',
  });
  const alLioRow = page.locator('[data-project-context="al-lio"]');

  await sidnAction.focus();
  await alLioRow.hover();

  await expect(backdrop).toHaveAttribute(
    'data-active-project',
    'sidn-cost-control',
  );

  await sidnAction.evaluate((element) => (element as HTMLElement).blur());
  await expect(backdrop).toHaveAttribute('data-active-project', 'al-lio');

  await page.mouse.move(0, 0);
  await expect(backdrop).not.toHaveAttribute('data-active-project');
});

test('reduced motion makes contextual switching instant', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./proyectos/');

  const context = page.locator(
    '[data-project-context-image="feedback2action"]',
  );
  const momentsLayer = page.locator('.projects-page__moments');

  await page
    .getByRole('button', { name: 'Ver proyecto Feedback2Action' })
    .focus();

  await expect(context).toHaveAttribute('data-active', '');
  await expect(context).toHaveCSS('transition-duration', '0s');
  await expect(context).toHaveCSS('filter', 'none');
  await expect(momentsLayer).toHaveCSS('transition-duration', '0s');
});

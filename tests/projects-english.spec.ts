import { expect, test } from '@playwright/test';

test('project cards and dialogs use approved English copy', async ({
  page,
}) => {
  await page.goto('./');

  for (const title of ['AL-LÍO', 'SIDN Cost Control', 'Feedback2Action']) {
    await expect(
      page.getByRole('button', { name: `View project ${title}` }),
    ).toBeVisible();
  }

  await page.getByRole('button', { name: 'View project AL-LÍO' }).click();
  const alLio = page.getByRole('dialog', { name: 'AL-LÍO' });
  await expect(alLio).toContainText(
    'AL-LÍO brings tasks, calendar, learning and professional opportunities into one place to reduce switching between separate tools.',
  );
  await expect(alLio).toContainText('PROJECT');
  await expect(alLio).toContainText('Objective');
  await expect(alLio).toContainText('Solution');
  await expect(alLio).toContainText('Role');
  await expect(alLio).toContainText('Next project');
  await expect(
    alLio.getByRole('link', { name: 'Open AL-LÍO demo' }),
  ).toBeVisible();
  await expect(
    alLio.getByRole('link', { name: 'View AL-LÍO code' }),
  ).toBeVisible();
  await expect(
    alLio.getByRole('link', { name: 'View AL-LÍO event' }),
  ).toHaveCount(0);
  await page.keyboard.press('Escape');

  await page
    .getByRole('button', { name: 'View project SIDN Cost Control' })
    .click();
  const sidn = page.getByRole('dialog', { name: 'SIDN Cost Control' });
  await expect(sidn).toContainText(
    'SIDN Cost Control provides a management dashboard for viewing and comparing advertising campaign spend.',
  );
  await expect(sidn).toContainText('Winner of I Edición GEN AI ARENA');
  await expect(
    sidn.getByRole('link', { name: 'View SIDN Cost Control event' }),
  ).toHaveAttribute('href', 'https://www.arenasidn.com/edicion-1');
  await expect(
    sidn.getByRole('link', { name: 'Open SIDN Cost Control demo' }),
  ).toHaveCount(0);
  await expect(
    sidn.getByRole('link', { name: 'View SIDN Cost Control code' }),
  ).toHaveCount(0);
  await page.keyboard.press('Escape');

  await page
    .getByRole('button', { name: 'View project Feedback2Action' })
    .click();
  const feedback = page.getByRole('dialog', { name: 'Feedback2Action' });
  await expect(feedback).toContainText(
    'Feedback2Action turns large volumes of reviews into grouped problems and prioritized actions.',
  );
  await expect(feedback).toContainText('22,376 reviews analyzed');
  await expect(feedback).toContainText('409 problem groups');
  await expect(feedback).toContainText('108 prioritized actions');
  await expect(
    feedback.getByRole('link', { name: 'View Feedback2Action event' }),
  ).toHaveAttribute('href', 'https://www.arenasidn.com/edicion-1');
  await expect(
    feedback.getByRole('link', { name: 'Open Feedback2Action demo' }),
  ).toHaveCount(0);
  await expect(
    feedback.getByRole('link', { name: 'View Feedback2Action code' }),
  ).toHaveCount(0);

  await page.goto('./proyectos/');
  await expect(page.locator('.project-row__description')).toHaveText([
    'AL-LÍO brings tasks, calendar, learning and professional opportunities into one place to reduce switching between separate tools.',
    'Team-built application for tracking and comparing advertising campaign spend.',
    'Review analysis that groups recurring problems and prioritizes actions using data and AI.',
  ]);

  for (const title of ['AL-LÍO', 'SIDN Cost Control', 'Feedback2Action']) {
    await expect(
      page.getByRole('button', { name: `View project ${title}` }),
    ).toBeVisible();
  }
});

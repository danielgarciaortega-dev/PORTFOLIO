import { expect, test } from '@playwright/test';

const projectTitles = ['AL-LÍO', 'SIDN Cost Control', 'Feedback2Action'];

test('Spanish project cards keep unique accessible CTAs and Spanish dialog copy', async ({
  page,
}) => {
  await page.goto('./proyectos/');

  for (const title of projectTitles) {
    await expect(
      page.getByRole('button', { name: `Ver proyecto ${title}` }),
    ).toHaveCount(1);
  }

  await page.getByRole('button', { name: 'Ver proyecto AL-LÍO' }).click();
  const dialog = page.getByRole('dialog', { name: 'AL-LÍO' });
  await expect(dialog).toContainText('PROYECTO');
  await expect(dialog.getByRole('heading', { name: 'Objetivo' })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Solución' })).toBeVisible();
  await expect(
    dialog.getByRole('link', { name: 'Abrir demo de AL-LÍO' }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('link', { name: 'Ver código de AL-LÍO' }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Cerrar AL-LÍO' }),
  ).toBeVisible();
});

test('English home uses approved project copy and unique accessible CTAs', async ({
  page,
}) => {
  await page.goto('./en/');

  for (const title of projectTitles) {
    await expect(
      page.getByRole('button', { name: `View project ${title}` }),
    ).toHaveCount(1);
  }

  await page.getByRole('button', { name: 'View project AL-LÍO' }).click();
  const alLioDialog = page.getByRole('dialog', { name: 'AL-LÍO' });
  await expect(alLioDialog).toContainText('PROJECT');
  await expect(
    alLioDialog.getByRole('heading', { name: 'Objective' }),
  ).toBeVisible();
  await expect(
    alLioDialog.getByRole('heading', { name: 'Solution' }),
  ).toBeVisible();
  await expect(alLioDialog).toContainText(
    'AL-LÍO brings tasks, calendar, learning and professional opportunities into one place to reduce switching between separate tools.',
  );
  await expect(
    alLioDialog.getByRole('link', { name: 'Open AL-LÍO demo' }),
  ).toBeVisible();
  await expect(
    alLioDialog.getByRole('link', { name: 'View AL-LÍO code' }),
  ).toBeVisible();
  await expect(
    alLioDialog.getByRole('button', { name: 'Close AL-LÍO' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

  await page
    .getByRole('button', { name: 'View project Feedback2Action' })
    .click();
  const feedbackDialog = page.getByRole('dialog', { name: 'Feedback2Action' });
  await expect(feedbackDialog).toContainText('22,376 reviews analyzed');
  await expect(feedbackDialog).toContainText('409 problem groups');
  await expect(feedbackDialog).toContainText('108 prioritized actions');
});

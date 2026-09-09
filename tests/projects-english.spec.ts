import { expect, test } from '@playwright/test';

test('project cards and dialogs use approved English copy', async ({
  page,
}) => {
  await page.goto('./');

  await expect(
    page.getByRole('button', { name: 'View project AL-LÍO' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'View project SIDN Cost Control' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'View project Feedback2Action' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'View project AL-LÍO' }).click();
  const alLio = page.getByRole('dialog', { name: 'AL-LÍO' });
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
  await page.keyboard.press('Escape');

  await page
    .getByRole('button', { name: 'View project SIDN Cost Control' })
    .click();
  const sidn = page.getByRole('dialog', { name: 'SIDN Cost Control' });
  await expect(sidn).toContainText(
    'SIDN Cost Control provides a management dashboard for viewing and comparing advertising campaign spend.',
  );
  await expect(sidn).toContainText('Winner of I Edición GEN AI ARENA');
  await page.keyboard.press('Escape');

  await page
    .getByRole('button', { name: 'View project Feedback2Action' })
    .click();
  const feedback = page.getByRole('dialog', { name: 'Feedback2Action' });
  await expect(feedback).toContainText('22,376 reviews analyzed');
  await expect(feedback).toContainText('409 problem groups');
  await expect(feedback).toContainText('108 prioritized actions');
});

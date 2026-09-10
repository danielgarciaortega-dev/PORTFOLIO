import { expect, test } from '@playwright/test';

test('issue 142 proof: a red required check must block merge', async () => {
  expect('protected-main').toBe('must-not-merge');
});

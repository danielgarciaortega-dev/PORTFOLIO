import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const config = JSON.parse(
  await readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
);

test('Vercel Git policy disables automatic deployments only for main', () => {
  assert.equal(config.$schema, 'https://openapi.vercel.sh/vercel.json');
  assert.notEqual(config.git?.deploymentEnabled, false);
  assert.equal(config.git?.deploymentEnabled?.main, false);
  assert.deepEqual(Object.keys(config.git.deploymentEnabled), ['main']);
});

test('Vercel Git policy avoids legacy GitHub config and sensitive linkage material', () => {
  assert.equal(config.github, undefined);

  const serialized = JSON.stringify(config);
  assert.doesNotMatch(
    serialized,
    /(VERCEL_TOKEN|VERCEL_ORG_ID|VERCEL_PROJECT_ID|bypassSecret|team_[A-Za-z0-9]+|prj_[A-Za-z0-9]+)/i,
  );
});

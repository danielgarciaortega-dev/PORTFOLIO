import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync('.github/workflows/validate.yml', 'utf8');

test('keeps stable repository and preview readiness check names', () => {
  assert.match(workflow, /name: Repository validation/);
  assert.match(workflow, /name: Preview readiness/);
  assert.match(workflow, /needs: quality/);
  assert.match(
    workflow,
    /if: \$\{\{ always\(\) && github\.event_name == 'pull_request' \}\}/,
  );
});

test('uses least-privilege read permissions for PR preview evidence', () => {
  for (const permission of [
    'contents: read',
    'issues: read',
    'pull-requests: read',
    'statuses: read',
  ]) {
    assert.match(workflow, new RegExp(permission));
  }

  assert.doesNotMatch(workflow, /pages:\s*write/);
  assert.doesNotMatch(workflow, /id-token:\s*write/);
  assert.doesNotMatch(workflow, /deployments:\s*write/);
});

test('binds preview readiness to the exact current pull-request head', () => {
  assert.match(
    workflow,
    /ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/,
  );
  assert.match(
    workflow,
    /EXPECTED_HEAD_SHA: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/,
  );
  assert.match(
    workflow,
    /REPOSITORY_VALIDATION_RESULT: \$\{\{ needs\.quality\.result \}\}/,
  );
  assert.match(workflow, /timeout-minutes: 12/);
});

test('runs the repository readiness helper without Vercel deployment commands', () => {
  assert.match(workflow, /run: node scripts\/preview-readiness\.mjs/);
  assert.doesNotMatch(workflow, /vercel\s+(?:deploy|--prod)/i);
  assert.doesNotMatch(workflow, /--prod\b/i);
});

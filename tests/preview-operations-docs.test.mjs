import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const runbook = readFileSync('docs/operations/PREVIEW_AND_PAGES.md', 'utf8');
const docsIndex = readFileSync('docs/README.md', 'utf8');

const requiredSourcePaths = [
  '.github/workflows/validate.yml',
  '.github/workflows/deploy.yml',
  '.github/workflows/branch-cleanup.yml',
  '.github/pull_request_template.md',
  'vercel.json',
  'scripts/lib/hosting-config.mjs',
  'scripts/preview-readiness.mjs',
  'scripts/lib/vercel-preview-evidence.mjs',
  'scripts/lib/preview-readiness.mjs',
  'scripts/lib/vercel-preview-fetch.mjs',
];

test('documents the production and preview responsibility split', () => {
  assert.match(runbook, /GitHub Pages is canonical production/);
  assert.match(runbook, /Vercel is preview\/review infrastructure only/);
  assert.match(runbook, /`main` is excluded from Vercel Git-triggered deployments|disables Vercel Git deployments for `main`/);
});

test('documents exact-head gates, protected Preview access and production gate names', () => {
  for (const requiredText of [
    '`Repository validation`',
    '`Preview readiness`',
    '`VERCEL_AUTOMATION_BYPASS_SECRET`',
    '`PUBLICATION_APPROVED`',
    '`pages: write`',
    '`id-token: write`',
    '`/PORTFOLIO`',
  ]) {
    assert.match(runbook, new RegExp(requiredText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('references the maintained implementation sources', () => {
  for (const sourcePath of requiredSourcePaths) {
    assert.match(runbook, new RegExp(sourcePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('contains an actionable troubleshooting matrix', () => {
  assert.match(runbook, /## 12\. Troubleshooting matrix/);
  assert.match(runbook, /Symptom \| Likely cause \| Safe diagnostic \| Corrective action/);
  assert.match(runbook, /stale head/i);
  assert.match(runbook, /Preview redirects to Vercel auth/);
  assert.match(runbook, /Pages deploy job is skipped/);
});

test('records the evolved reuse model without creating a runtime dependency', () => {
  assert.match(runbook, /no runtime dependency/i);
  assert.match(runbook, /does not trust a `Vercel` status context by itself/);
  assert.match(runbook, /does not deploy Vercel from GitHub Actions/);
});

test('links the runbook from the docs index', () => {
  assert.match(docsIndex, /operations\/PREVIEW_AND_PAGES\.md/);
});

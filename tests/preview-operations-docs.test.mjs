import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const runbook = readFileSync('docs/operations/PREVIEW_AND_PAGES.md', 'utf8');
const docsIndex = readFileSync('docs/README.md', 'utf8');
const branchLifecycle = readFileSync(
  'docs/operations/BRANCH_LIFECYCLE.md',
  'utf8',
);

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
  'scripts/capture-preview-visual-evidence.mjs',
  'scripts/lib/preview-visual-evidence.mjs',
  'tests/preview-visual-evidence.test.mjs',
];

test('documents the production and preview responsibility split', () => {
  assert.match(runbook, /GitHub Pages is canonical production/);
  assert.match(runbook, /Vercel is preview\/review infrastructure only/);
  assert.match(
    runbook,
    /`main` is excluded from Vercel Git-triggered deployments|disables Vercel Git deployments for `main`/,
  );
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
    assert.match(
      runbook,
      new RegExp(requiredText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    );
  }
});

test('references the maintained implementation sources', () => {
  for (const sourcePath of requiredSourcePaths) {
    assert.match(
      runbook,
      new RegExp(sourcePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    );
  }
});

test('documents exact-head visual evidence without promoting it to a required gate', () => {
  assert.match(runbook, /Preview visual evidence/);
  assert.match(runbook, /preview-visual-evidence-<PR>-<SHA>/);
  assert.match(runbook, /390×844/);
  assert.match(runbook, /768×1024/);
  assert.match(runbook, /1440×900/);
  assert.match(runbook, /1920×1080/);
  assert.match(runbook, /not a branch-protection gate/i);
  assert.match(runbook, /does not approve a PR/i);
  assert.match(docsIndex, /artifact efímero/i);
  assert.match(docsIndex, /no es un tercer gate requerido/i);
});

test('documents visual-evidence secret isolation', () => {
  assert.match(runbook, /exact validated Preview origin/i);
  assert.match(runbook, /never contain the secret/i);
  assert.match(docsIndex, /El secreto no se imprime/i);
  assert.match(docsIndex, /no se sube al artifact/i);
});

test('contains an actionable troubleshooting matrix', () => {
  assert.match(runbook, /## 12\. Troubleshooting matrix/);
  assert.match(
    runbook,
    /Symptom\s+\|\s+Likely cause\s+\|\s+Safe diagnostic\s+\|\s+Corrective action/,
  );
  assert.match(runbook, /stale head/i);
  assert.match(runbook, /Preview redirects to Vercel auth/);
  assert.match(runbook, /Preview visual evidence` fails/);
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

test('documents safe stale-branch retirement without broad automatic deletion', () => {
  assert.match(branchLifecycle, /branch-cleanup\.yml` is intentionally merge-driven/i);
  assert.match(branchLifecycle, /does \*\*not\*\* delete/i);
  assert.match(branchLifecycle, /abandoned branches with no pull request/i);
  assert.match(branchLifecycle, /delete only the exact audited ref/i);
  assert.match(branchLifecycle, /Do not add glob-based, age-only or ownership-blind deletion/i);
  assert.match(branchLifecycle, /#53 must start from a fresh branch/i);
  assert.match(branchLifecycle, /#54 must start only after the new #53 is merged/i);
});

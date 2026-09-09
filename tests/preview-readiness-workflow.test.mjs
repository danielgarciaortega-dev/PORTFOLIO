import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync('.github/workflows/validate.yml', 'utf8');
const readinessEntry = readFileSync('scripts/preview-readiness.mjs', 'utf8');
const captureEntry = readFileSync(
  'scripts/capture-preview-visual-evidence.mjs',
  'utf8',
);

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

test('isolates unrelated Google Chrome APT metadata without weakening Playwright setup', () => {
  assert.match(workflow, /google-chrome\.list/);
  assert.match(workflow, /google-chrome\.sources/);
  assert.match(workflow, /npx playwright install --with-deps chromium/);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/);
});

test('passes only the approved Vercel automation bypass secret to preview automation', () => {
  assert.match(
    workflow,
    /VERCEL_AUTOMATION_BYPASS_SECRET: \$\{\{ secrets\.VERCEL_AUTOMATION_BYPASS_SECRET \}\}/,
  );
  assert.doesNotMatch(workflow, /VERCEL_TOKEN:/);
  assert.doesNotMatch(workflow, /VERCEL_PROJECT_ID:/);
  assert.doesNotMatch(workflow, /VERCEL_ORG_ID:/);
});

test('runs readiness without Vercel deployment commands', () => {
  assert.match(workflow, /run: node scripts\/preview-readiness\.mjs/);
  assert.doesNotMatch(workflow, /vercel\s+(?:deploy|--prod)/i);
  assert.doesNotMatch(workflow, /--prod\b/i);
});

test('exports only the validated exact-head Preview URL to a downstream job', () => {
  assert.match(workflow, /id: preview_readiness/);
  assert.match(readinessEntry, /process\.env\.GITHUB_OUTPUT/);
  assert.match(
    readinessEntry,
    /preview_url=\$\{result\.evidence\.previewUrl\}/,
  );
  assert.match(
    workflow,
    /outputs:\s*\n\s*preview_url: \$\{\{ steps\.preview_readiness\.outputs\.preview_url \}\}/,
  );
  assert.match(
    workflow,
    /PREVIEW_URL: \$\{\{ needs\.preview\.outputs\.preview_url \}\}/,
  );
});

test('keeps visual evidence separate from the two required gates', () => {
  assert.match(
    workflow,
    /visual_evidence:\s*\n\s*name: Preview visual evidence/,
  );
  assert.match(workflow, /visual_evidence:[\s\S]*?needs: preview/);
  assert.match(
    workflow,
    /visual_evidence:[\s\S]*?if: \$\{\{ github\.event_name == 'pull_request' && contains\(github\.event\.pull_request\.body, '- \[x\] Visual'\) \}\}/,
  );
  assert.doesNotMatch(
    workflow,
    /preview:[\s\S]*?run: node scripts\/capture-preview-visual-evidence\.mjs[\s\S]*?visual_evidence:/,
  );
});

test('captures protected Preview evidence only for explicitly Visual PRs', () => {
  assert.match(
    workflow,
    /run: node scripts\/capture-preview-visual-evidence\.mjs/,
  );
  assert.match(captureEntry, /buildPreviewRequestHeaders/);
  assert.match(captureEntry, /EXPECTED_HEAD_SHA/);
  assert.match(captureEntry, /PREVIEW_URL/);
});

test('uploads exact-head evidence with a pinned artifact action and short retention', () => {
  assert.match(
    workflow,
    /actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7\.0\.1/,
  );
  assert.match(
    workflow,
    /name: preview-visual-evidence-\$\{\{ github\.event\.pull_request\.number \}\}-\$\{\{ github\.event\.pull_request\.head\.sha \}\}/,
  );
  assert.match(workflow, /path: artifacts\/preview-visual-evidence\//);
  assert.match(workflow, /retention-days: 7/);
});

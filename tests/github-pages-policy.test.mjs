import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const retiredProvider = ['ver', 'cel'].join('');
const read = (path) => readFileSync(path, 'utf8');

const retiredIntegrationPaths = [
  `${retiredProvider}.json`,
  'scripts/preview-readiness.mjs',
  'scripts/capture-preview-visual-evidence.mjs',
  'scripts/lib/preview-readiness.mjs',
  'scripts/lib/preview-requirement.mjs',
  'scripts/lib/preview-visual-evidence.mjs',
  `scripts/lib/${retiredProvider}-preview-evidence.mjs`,
  `scripts/lib/${retiredProvider}-preview-fetch.mjs`,
  `tests/${retiredProvider}-git-policy.test.mjs`,
  `tests/${retiredProvider}-preview-evidence.test.mjs`,
  `tests/${retiredProvider}-preview-fetch.test.mjs`,
  'tests/preview-readiness.test.mjs',
  'tests/preview-readiness-workflow.test.mjs',
  'tests/preview-requirement.test.mjs',
  'tests/preview-visual-evidence.test.mjs',
  'tests/preview-operations-docs.test.mjs',
  'tests/visual-review-contract.test.mjs',
  'docs/operations/PREVIEW_REQUIREMENT_CLASSIFICATION.md',
  `docs/operations/${retiredProvider}-pr-preview-architecture.md`,
  'docs/operations/PREVIEW_AND_PAGES.md',
];

test('retired external Preview integration files stay removed', () => {
  for (const path of retiredIntegrationPaths) {
    assert.equal(existsSync(path), false, `${path} must stay removed`);
  }
});

test('pull-request gates are GitHub-only and build the exact head for Pages', () => {
  const workflow = read('.github/workflows/validate.yml');

  assert.match(workflow, /name: Repository validation/);
  assert.match(workflow, /name: Preview readiness/);
  assert.match(workflow, /npm run test:pages/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /github\.event\.pull_request\.head\.sha/);
  assert.doesNotMatch(workflow, new RegExp(retiredProvider, 'i'));
  assert.doesNotMatch(workflow, /PREVIEW_URL|AUTOMATION_BYPASS_SECRET/i);
});

test('production deployment remains GitHub Pages only', () => {
  const deployWorkflow = read('.github/workflows/deploy.yml');

  assert.match(deployWorkflow, /name: Deploy to GitHub Pages/);
  assert.match(deployWorkflow, /actions\/deploy-pages@/);
  assert.doesNotMatch(deployWorkflow, new RegExp(retiredProvider, 'i'));
});

test('package scripts keep a focused Pages readiness regression suite', () => {
  const packageJson = JSON.parse(read('package.json'));

  assert.match(packageJson.scripts['test:pages'], /astro-hosting-config/);
  assert.match(packageJson.scripts['test:pages'], /github-pages-policy/);
  assert.doesNotMatch(packageJson.scripts['test:config'], new RegExp(retiredProvider, 'i'));
});

test('maintained Pages runbook replaces provider-specific Preview docs', () => {
  assert.equal(existsSync('docs/operations/GITHUB_PAGES.md'), true);
  const runbook = read('docs/operations/GITHUB_PAGES.md');

  assert.match(runbook, /GitHub Pages/);
  assert.match(runbook, /Repository validation/);
  assert.doesNotMatch(runbook, new RegExp(retiredProvider, 'i'));
});

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const retiredProvider = ['ver', 'cel'].join('');
const read = (path) => readFileSync(path, 'utf8');

const retiredIntegrationPaths = [
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

test('retired Preview files stay removed', () => {
  for (const path of retiredIntegrationPaths) {
    assert.equal(existsSync(path), false, `${path} must stay removed`);
  }
});

test('external Git deployments stay disabled', () => {
  const guard = JSON.parse(read(`${retiredProvider}.json`));
  assert.equal(guard.git?.deploymentEnabled, false);
});

test('PR gates stay GitHub-only', () => {
  const workflow = read('.github/workflows/validate.yml');

  assert.match(workflow, /name: Repository validation/);
  assert.match(workflow, /name: Preview readiness/);
  assert.match(workflow, /npm run test:pages/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /github\.event\.pull_request\.head\.sha/);
  assert.doesNotMatch(workflow, new RegExp(retiredProvider, 'i'));
  assert.doesNotMatch(workflow, /PREVIEW_URL|AUTOMATION_BYPASS_SECRET/i);
});

test('production stays on GitHub Pages', () => {
  const deployWorkflow = read('.github/workflows/deploy.yml');

  assert.match(deployWorkflow, /name: Deploy to GitHub Pages/);
  assert.match(deployWorkflow, /actions\/deploy-pages@/);
  assert.doesNotMatch(deployWorkflow, new RegExp(retiredProvider, 'i'));
});

test('package scripts expose the Pages test suite', () => {
  const packageJson = JSON.parse(read('package.json'));
  const configTests = packageJson.scripts['test:config'];

  assert.match(packageJson.scripts['test:pages'], /astro-hosting-config/);
  assert.match(packageJson.scripts['test:pages'], /github-pages-policy/);
  assert.doesNotMatch(configTests, new RegExp(retiredProvider, 'i'));
});

test('Pages runbook stays maintained', () => {
  assert.equal(existsSync('docs/operations/GITHUB_PAGES.md'), true);
  const runbook = read('docs/operations/GITHUB_PAGES.md');

  assert.match(runbook, /GitHub Pages/);
  assert.match(runbook, /Repository validation/);
});

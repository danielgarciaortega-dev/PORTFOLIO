import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const runbook = readFileSync('docs/operations/PREVIEW_AND_PAGES.md', 'utf8');
const docsIndex = readFileSync('docs/README.md', 'utf8');
const agents = readFileSync('AGENTS.md', 'utf8');
const rootReadme = readFileSync('README.md', 'utf8');
const branchLifecycle = readFileSync(
  'docs/operations/BRANCH_LIFECYCLE.md',
  'utf8',
);
const shellContract = readFileSync('docs/operations/FINAL_SHELL.md', 'utf8');

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
  assert.match(
    branchLifecycle,
    /branch-cleanup\.yml` is intentionally merge-driven/i,
  );
  assert.match(branchLifecycle, /does \*\*not\*\* delete/i);
  assert.match(branchLifecycle, /abandoned branches with no pull request/i);
  assert.match(branchLifecycle, /delete only the exact audited ref/i);
  assert.match(
    branchLifecycle,
    /Do not add glob-based, age-only or ownership-blind deletion/i,
  );
  assert.match(branchLifecycle, /#53 must start from a fresh branch/i);
  assert.match(
    branchLifecycle,
    /#54 must start only after the new #53 is merged/i,
  );
});

test('documents the final bilingual shell and its ownership boundaries', () => {
  for (const requiredText of [
    'Spanish is the default locale at `/`',
    'English is published under `/en/`',
    'GitHub and LinkedIn are the only retained former-footer social actions',
    'The public site shell has no full `.site-footer` surface',
    '`Header.astro` still targets `/proyectos/`',
    '`Header.astro` still targets `/cv/`',
    '#53 owns `/proyectos/` ↔ `/en/projects/` navigation semantics',
    '#54 owns canonical/hreflang/Open Graph and locale-aware 404 semantics',
    '#55 owns `/cv/` ↔ `/en/cv/`',
    'tests/shell-regressions.spec.ts',
  ]) {
    assert.match(
      shellContract,
      new RegExp(requiredText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    );
  }

  assert.match(shellContract, /exactly one target-locale action/i);
  assert.match(shellContract, /desktop widths above 900 px/i);
  assert.match(shellContract, /At 900 px and below/i);
  assert.match(shellContract, /numbered primary navigation/i);
  assert.match(
    shellContract,
    /CV-specific professional-footer|professional-footer/i,
  );
  assert.match(
    shellContract,
    /evidence from another SHA must never be reused/i,
  );
  assert.match(docsIndex, /operations\/FINAL_SHELL\.md/);
});

test('top-level agent instructions match the current bilingual architecture', () => {
  assert.doesNotMatch(agents, /Sitio en español\./);
  assert.match(agents, /Spanish and English are first-class public locales/);
  assert.match(agents, /Spanish default\/root home at `\/`/);
  assert.match(agents, /English home at `\/en\/`/);
  assert.match(agents, /Exactly one target-locale action/);
  assert.match(agents, /Current projects route: `\/proyectos\/`/);
  assert.match(agents, /#53 owns the future English counterpart `\/en\/projects\/`/);
  assert.match(agents, /Current CV route: `\/cv\/`/);
  assert.match(agents, /#55 owns the future English counterpart `\/en\/cv\/`/);
  assert.match(agents, /GitHub Pages is canonical production/);
  assert.match(agents, /Repository validation` is the authoritative code\/test gate/);
  assert.match(agents, /must never be used to conceal a failing `Repository validation`/);
  assert.match(agents, /Never revive, merge, rebase forward or cherry-pick/);
});

test('README distinguishes deployed routes from planned bilingual counterparts', () => {
  assert.match(rootReadme, /## Bilingual architecture/);
  assert.match(rootReadme, /Spanish:\s+`\/`/);
  assert.match(rootReadme, /English:\s+`\/en\/`/);
  assert.match(rootReadme, /current projects and CV entry points remain `\/proyectos\/` and `\/cv\/`/);
  assert.match(rootReadme, /must not present planned `\/en\/projects\/` or `\/en\/cv\/` counterparts as already deployed/);
  assert.match(rootReadme, /GitHub Pages is canonical production/);
  assert.match(rootReadme, /Vercel remains configured only as PR Preview\/review infrastructure/);
  assert.match(rootReadme, /docs\/operations\/FINAL_SHELL\.md/);
  assert.match(rootReadme, /docs\/operations\/PREVIEW_AND_PAGES\.md/);
});

test('docs index limits owner recovery to external Preview failures', () => {
  assert.match(docsIndex, /bypass de recuperación limitada a pull requests/i);
  assert.match(docsIndex, /Repository validation` debe quedar verde/i);
  assert.match(docsIndex, /se limita al bloqueo de Preview/i);
  assert.match(docsIndex, /no permite reutilizar evidencia de otro SHA/i);
  assert.match(docsIndex, /ni usar Vercel como producción/i);
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  PreviewRequirementError,
  assertStableRepositoryOnlyRequirement,
  classifyPreviewRequirement,
  isRepositoryOnlyPreviewPath,
  isVisualPullRequest,
  loadGitHubPreviewRequirement,
} from '../scripts/lib/preview-requirement.mjs';

const HEAD = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const readinessEntry = readFileSync('scripts/preview-readiness.mjs', 'utf8');
const policyDoc = readFileSync(
  'docs/operations/PREVIEW_REQUIREMENT_CLASSIFICATION.md',
  'utf8',
);

function expectRequirementError(error, code) {
  assert.ok(error instanceof PreviewRequirementError);
  assert.equal(error.code, code);
  return true;
}

function pullRequest(overrides = {}) {
  return {
    head: { sha: HEAD },
    changed_files: 1,
    body: '- [ ] Visual\n- [x] Non-visual',
    ...overrides,
  };
}

function file(filename, overrides = {}) {
  return { filename, status: 'modified', ...overrides };
}

function createGitHubFetch({
  pull = pullRequest(),
  pages = [[file('tests/a.test.mjs')]],
} = {}) {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    const parsed = new URL(url);
    if (parsed.pathname.endsWith('/pulls/125')) return Response.json(pull);
    if (parsed.pathname.endsWith('/pulls/125/files')) {
      const page = Number(parsed.searchParams.get('page') ?? '1');
      return Response.json(pages[page - 1] ?? []);
    }
    return Response.json({ message: 'unexpected' }, { status: 404 });
  };
  return { fetchImpl, requests };
}

async function loadWith(fetchImpl) {
  return loadGitHubPreviewRequirement({
    fetchImpl,
    repository: 'owner/repo',
    prNumber: 125,
    expectedHeadSha: HEAD,
    token: 'test-token',
  });
}

test('allows only verified repository-only paths and rejects deployable or unsafe paths', () => {
  for (const path of [
    'tests/foo.spec.ts',
    'docs/operations/runbook.md',
    'docs/screenshots/reference.png',
    'README.md',
    'AGENTS.md',
    'scripts/capture-preview-visual-evidence.mjs',
  ]) {
    assert.equal(isRepositoryOnlyPreviewPath(path), true, path);
  }

  for (const path of [
    'src/pages/index.astro',
    'public/favicon.svg',
    '.github/workflows/validate.yml',
    'scripts/preview-readiness.mjs',
    'scripts/lib/preview-requirement.mjs',
    'astro.config.mjs',
    'vercel.json',
    'package.json',
    'package-lock.json',
    'unknown/new-file.xyz',
    '../tests/foo.spec.ts',
    'tests/../src/index.astro',
    '/tests/foo.spec.ts',
    'tests\\foo.spec.ts',
    'docs/../src/index.astro',
    '/docs/operations/runbook.md',
    'docs\\operations\\runbook.md',
  ]) {
    assert.equal(isRepositoryOnlyPreviewPath(path), false, path);
  }
});

test('classifies verified documentation, tests and exact helper changes as repository-only', () => {
  const result = classifyPreviewRequirement({
    changedPaths: [
      'docs/operations/PREVIEW_REQUIREMENT_CLASSIFICATION.md',
      'tests/preview-requirement.test.mjs',
      'README.md',
      'AGENTS.md',
      'scripts/capture-preview-visual-evidence.mjs',
    ],
  });
  assert.equal(result.previewRequired, false);
  assert.equal(result.reason, 'repository-only');
});

test('one deployable or unknown path forces an exact-head Preview', () => {
  for (const path of [
    'src/pages/index.astro',
    'public/favicon.svg',
    '.github/workflows/validate.yml',
    'scripts/preview-readiness.mjs',
    'scripts/lib/preview-requirement.mjs',
    'astro.config.mjs',
    'vercel.json',
    'package.json',
    'package-lock.json',
    'unknown/new-file.xyz',
  ]) {
    const result = classifyPreviewRequirement({
      changedPaths: ['docs/README.md', 'tests/foo.spec.ts', path],
    });
    assert.equal(result.previewRequired, true, path);
    assert.equal(result.reason, 'deployable-or-unknown-path', path);
  }
});

test('an explicitly Visual PR always requires a real Preview even for docs-only changes', () => {
  assert.equal(isVisualPullRequest('- [x] Visual\n- [ ] Non-visual'), true);
  const result = classifyPreviewRequirement({
    changedPaths: ['docs/operations/runbook.md', 'README.md'],
    isVisual: true,
  });
  assert.equal(result.previewRequired, true);
  assert.equal(result.reason, 'visual-pr');
});

test('loads all changed-file pages and binds repository-only docs to the live head', async () => {
  const firstPage = Array.from({ length: 100 }, (_, index) =>
    file(`tests/case-${index}.test.mjs`),
  );
  const secondPage = [file('docs/operations/runbook.md')];
  const { fetchImpl, requests } = createGitHubFetch({
    pull: pullRequest({ changed_files: 101 }),
    pages: [firstPage, secondPage],
  });

  const result = await loadWith(fetchImpl);
  assert.equal(result.previewRequired, false);
  assert.equal(result.changedFileCount, 101);
  assert.equal(result.changedPaths.length, 101);
  assert.equal(
    requests.filter((request) =>
      new URL(request.url).pathname.endsWith('/files'),
    ).length,
    2,
  );
  for (const request of requests) {
    assert.equal(request.options.headers.Authorization, 'Bearer test-token');
  }
});

test('renames crossing the repository-only boundary still require Preview', async () => {
  for (const renamedFile of [
    file('docs/renamed.md', {
      status: 'renamed',
      previous_filename: 'src/pages/index.astro',
    }),
    file('src/pages/renamed.astro', {
      status: 'renamed',
      previous_filename: 'docs/old-page.md',
    }),
  ]) {
    const { fetchImpl } = createGitHubFetch({ pages: [[renamedFile]] });
    const result = await loadWith(fetchImpl);
    assert.equal(result.previewRequired, true);
    assert.equal(result.reason, 'deployable-or-unknown-path');
    assert.equal(result.changedPaths.length, 2);
  }
});

test('fails closed when the live PR head differs from the workflow head', async () => {
  const { fetchImpl } = createGitHubFetch({
    pull: pullRequest({
      head: { sha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
    }),
  });

  await assert.rejects(
    () => loadWith(fetchImpl),
    (error) => expectRequirementError(error, 'STALE_HEAD'),
  );
});

test('fails closed on incomplete changed-file pagination', async () => {
  const { fetchImpl } = createGitHubFetch({
    pull: pullRequest({ changed_files: 101 }),
    pages: [[file('tests/only-one.test.mjs')], []],
  });

  await assert.rejects(
    () => loadWith(fetchImpl),
    (error) => expectRequirementError(error, 'GITHUB_FILES_INCOMPLETE'),
  );
});

test('fails closed on duplicate changed-file entries', async () => {
  const { fetchImpl } = createGitHubFetch({
    pull: pullRequest({ changed_files: 2 }),
    pages: [
      [file('tests/duplicate.test.mjs'), file('tests/duplicate.test.mjs')],
    ],
  });

  await assert.rejects(
    () => loadWith(fetchImpl),
    (error) => expectRequirementError(error, 'GITHUB_FILES_INVALID'),
  );
});

test('fails closed on malformed changed-file metadata', async () => {
  const { fetchImpl } = createGitHubFetch({
    pull: pullRequest({ changed_files: null }),
  });

  await assert.rejects(
    () => loadWith(fetchImpl),
    (error) => expectRequirementError(error, 'GITHUB_FILES_INVALID'),
  );
});

test('repository-only classification must remain identical at final revalidation', () => {
  const snapshot = {
    expectedHeadSha: HEAD,
    liveHeadSha: HEAD,
    changedFileCount: 2,
    changedPaths: ['docs/README.md', 'tests/foo.spec.ts'],
    isVisual: false,
    previewRequired: false,
    reason: 'repository-only',
  };

  assert.deepEqual(
    assertStableRepositoryOnlyRequirement({
      initial: snapshot,
      final: { ...snapshot, changedPaths: [...snapshot.changedPaths] },
      expectedHeadSha: HEAD,
    }),
    snapshot,
  );

  assert.throws(
    () =>
      assertStableRepositoryOnlyRequirement({
        initial: snapshot,
        final: {
          ...snapshot,
          changedPaths: [
            'docs/README.md',
            'tests/foo.spec.ts',
            'src/pages/index.astro',
          ],
          changedFileCount: 3,
          previewRequired: true,
          reason: 'deployable-or-unknown-path',
        },
        expectedHeadSha: HEAD,
      }),
    (error) => expectRequirementError(error, 'PREVIEW_REQUIREMENT_CHANGED'),
  );
});

test('entrypoint classifies before constructing Vercel Preview access', () => {
  const classifyIndex = readinessEntry.indexOf(
    'await loadGitHubPreviewRequirement(requirementInput)',
  );
  const repositoryOnlyIndex = readinessEntry.indexOf(
    'if (!initialRequirement.previewRequired)',
  );
  const vercelFetchIndex = readinessEntry.indexOf('createVercelPreviewFetch(');

  assert.ok(classifyIndex >= 0);
  assert.ok(repositoryOnlyIndex > classifyIndex);
  assert.ok(vercelFetchIndex > repositoryOnlyIndex);
  assert.match(readinessEntry, /preview_required=false/);
  assert.match(readinessEntry, /preview_url=/);
  assert.match(readinessEntry, /preview_required=true/);
});

test('documents the verified fail-closed repository-only boundary', () => {
  assert.match(policyDoc, /`tests\/\*\*`/);
  assert.match(policyDoc, /`docs\/\*\*`/);
  assert.match(policyDoc, /root `README\.md`/);
  assert.match(policyDoc, /root `AGENTS\.md`/);
  assert.match(policyDoc, /`scripts\/capture-preview-visual-evidence\.mjs`/);
  assert.match(
    policyDoc,
    /Visual pull requests always require a real exact-head Preview/,
  );
  assert.match(policyDoc, /previous_filename/);
  assert.match(policyDoc, /fails closed/i);
  assert.match(policyDoc, /no Vercel Preview URL is invented or reused/);
  assert.match(policyDoc, /`src\/\*\*`/);
  assert.match(policyDoc, /`public\/\*\*`/);
  assert.match(policyDoc, /unknown path/i);
});

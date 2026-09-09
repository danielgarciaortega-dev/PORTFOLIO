import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PreviewEvidenceError,
  extractVercelUrls,
  isVercelInspectorUrl,
  isVercelPreviewUrl,
  resolveVercelPreviewEvidence,
} from '../scripts/lib/vercel-preview-evidence.mjs';

const HEAD = '8b20270b4107d27259945bf3a274277c3faec2d7';
const OLD_HEAD = '7666d8a50fecbd774f0e6474641b5559508ac74f';
const INSPECTOR =
  'https://vercel.com/danieelgrcs-projects/portfolio/2YrDDs9PSXRY9yQQ3HVjGbAdgjJj';
const OLD_INSPECTOR =
  'https://vercel.com/danieelgrcs-projects/portfolio/6zWzUkBimgXX4PDmKZbcZoMRns4e';
const PREVIEW =
  'https://portfolio-git-chore-vercel-preview-proof-danieelgrcs-projects.vercel.app';

function vercelStatus(overrides = {}) {
  return {
    context: 'Vercel',
    state: 'success',
    target_url: INSPECTOR,
    ...overrides,
  };
}

function vercelComment(overrides = {}) {
  return {
    id: 5604152506,
    body: `The latest updates on your projects.\n\n| Project | Deployment | Actions |\n| --- | --- | --- |\n| [portfolio](https://vercel.com/danieelgrcs-projects/portfolio) | [Ready](${INSPECTOR}) | [Preview](${PREVIEW}) |`,
    updated_at: '2026-09-09T15:14:34Z',
    user: { login: 'vercel[bot]', type: 'Bot' },
    ...overrides,
  };
}

function resolve(overrides = {}) {
  return resolveVercelPreviewEvidence({
    expectedHeadSha: HEAD,
    liveHeadSha: HEAD,
    statuses: [vercelStatus()],
    comments: [vercelComment()],
    ...overrides,
  });
}

function expectEvidenceError(fn, code, retryable = false) {
  assert.throws(fn, (error) => {
    assert.ok(error instanceof PreviewEvidenceError);
    assert.equal(error.code, code);
    assert.equal(error.retryable, retryable);
    return true;
  });
}

test('resolves exact-head Vercel status and official bot evidence', () => {
  assert.deepEqual(resolve(), {
    headSha: HEAD,
    statusState: 'success',
    inspectorUrl: INSPECTOR,
    previewUrl: PREVIEW,
    commentId: 5604152506,
    commentUpdatedAt: '2026-09-09T15:14:34Z',
  });
});

test('fails closed when the live pull-request head changed after workflow start', () => {
  expectEvidenceError(
    () => resolve({ liveHeadSha: OLD_HEAD }),
    'STALE_HEAD',
  );
});

test('treats a missing current-head Vercel status as retryable instead of trusting old evidence', () => {
  expectEvidenceError(
    () => resolve({ statuses: [] }),
    'VERCEL_STATUS_MISSING',
    true,
  );
});

test('treats a pending current-head Vercel deployment as retryable', () => {
  expectEvidenceError(
    () => resolve({ statuses: [vercelStatus({ state: 'pending' })] }),
    'VERCEL_STATUS_PENDING',
    true,
  );
});

for (const state of ['failure', 'error']) {
  test(`fails immediately on terminal Vercel state ${state}`, () => {
    expectEvidenceError(
      () => resolve({ statuses: [vercelStatus({ state })] }),
      'VERCEL_STATUS_FAILED',
    );
  });
}

test('rejects conflicting Vercel statuses for the same current head', () => {
  expectEvidenceError(
    () =>
      resolve({
        statuses: [
          vercelStatus(),
          vercelStatus({ state: 'pending', target_url: OLD_INSPECTOR }),
        ],
      }),
    'VERCEL_STATUS_AMBIGUOUS',
  );
});

test('rejects a malformed or non-Vercel status target URL', () => {
  for (const target_url of [
    'http://vercel.com/scope/project/deployment',
    'https://example.com/scope/project/deployment',
    'https://vercel.com/scope/project',
  ]) {
    expectEvidenceError(
      () => resolve({ statuses: [vercelStatus({ target_url })] }),
      'VERCEL_INSPECTOR_INVALID',
    );
  }
});

test('does not trust a stable Preview alias when the bot comment still points at the old inspector deployment', () => {
  const staleComment = vercelComment({
    body: `| Project | Deployment | Actions |\n| --- | --- | --- |\n| portfolio | [Ready](${OLD_INSPECTOR}) | [Preview](${PREVIEW}) |`,
  });

  expectEvidenceError(
    () => resolve({ comments: [staleComment] }),
    'VERCEL_COMMENT_NOT_READY',
    true,
  );
});

test('rejects spoofed non-Vercel comments even when they contain valid-looking URLs', () => {
  expectEvidenceError(
    () =>
      resolve({
        comments: [
          vercelComment({ user: { login: 'attacker', type: 'User' } }),
        ],
      }),
    'VERCEL_COMMENT_MISSING',
    true,
  );
});

test('requires the official GitHub bot identity, not only the vercel[bot] display login', () => {
  expectEvidenceError(
    () =>
      resolve({
        comments: [
          vercelComment({ user: { login: 'vercel[bot]', type: 'User' } }),
        ],
      }),
    'VERCEL_COMMENT_MISSING',
    true,
  );
});

test('rejects a matching bot comment with no Preview URL', () => {
  expectEvidenceError(
    () =>
      resolve({
        comments: [
          vercelComment({
            body: `| Deployment |\n| --- |\n| [Ready](${INSPECTOR}) |`,
          }),
        ],
      }),
    'VERCEL_PREVIEW_AMBIGUOUS',
  );
});

test('rejects multiple Preview URLs in the matching official comment', () => {
  expectEvidenceError(
    () =>
      resolve({
        comments: [
          vercelComment({
            body: `[Ready](${INSPECTOR}) [Preview](${PREVIEW}) [Preview](https://another-preview.vercel.app)`,
          }),
        ],
      }),
    'VERCEL_PREVIEW_AMBIGUOUS',
  );
});

test('rejects multiple official comments that both claim the current inspector deployment', () => {
  expectEvidenceError(
    () =>
      resolve({
        comments: [vercelComment(), vercelComment({ id: 5604152507 })],
      }),
    'VERCEL_COMMENT_AMBIGUOUS',
  );
});

test('extracts only HTTPS Vercel inspector and Preview URLs', () => {
  const urls = extractVercelUrls(
    `https://vercel.com/scope/project/deployment https://scope-project.vercel.app https://example.com/nope http://bad.vercel.app`,
  );

  assert.deepEqual(urls.inspectorUrls, [
    'https://vercel.com/scope/project/deployment',
  ]);
  assert.deepEqual(urls.previewUrls, ['https://scope-project.vercel.app/']);
  assert.equal(isVercelInspectorUrl('https://vercel.com/scope/project'), false);
  assert.equal(
    isVercelInspectorUrl('https://vercel.com/scope/project/deployment'),
    true,
  );
  assert.equal(isVercelPreviewUrl('https://vercel.app'), false);
  assert.equal(isVercelPreviewUrl('http://preview.vercel.app'), false);
  assert.equal(isVercelPreviewUrl('https://preview.vercel.app'), true);
});

test('matches the structural behavior observed in disposable PR #106 commit B', () => {
  const result = resolveVercelPreviewEvidence({
    expectedHeadSha: HEAD,
    liveHeadSha: HEAD,
    statuses: [
      {
        context: 'Vercel',
        state: 'success',
        target_url: INSPECTOR,
      },
    ],
    comments: [
      {
        id: 5604152506,
        updated_at: '2026-09-09T15:14:34Z',
        user: { login: 'vercel[bot]', type: 'Bot' },
        body: `The latest updates on your projects.\n\n| Project | Deployment | Actions | Updated |\n| --- | --- | --- | --- |\n| [portfolio](https://vercel.com/danieelgrcs-projects/portfolio) | [Ready](${INSPECTOR}) | [Preview](${PREVIEW}) | Sep 9 |`,
      },
    ],
  });

  assert.equal(result.headSha, HEAD);
  assert.equal(result.inspectorUrl, INSPECTOR);
  assert.equal(result.previewUrl, PREVIEW);
});

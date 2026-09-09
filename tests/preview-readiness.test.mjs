import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_ASSET_PATH,
  DEFAULT_BASE_LEAK_PATH,
  DEFAULT_HTML_ROUTES,
  DEFAULT_MISSING_PATH,
  PreviewReadinessError,
  fetchPreviewResource,
  loadGitHubPreviewEvidence,
  runPreviewReadiness,
  smokePreview,
  waitForPreviewEvidence,
} from '../scripts/lib/preview-readiness.mjs';

const HEAD = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const INSPECTOR =
  'https://vercel.com/example-team/portfolio/Deployment123456789012345';
const PREVIEW = 'https://portfolio-git-example.vercel.app/';

function evidenceInput(overrides = {}) {
  return {
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
        id: 1,
        user: { login: 'vercel[bot]', type: 'Bot' },
        body: `[Ready](${INSPECTOR}) [Preview](${PREVIEW})`,
        updated_at: '2026-09-09T15:00:00Z',
      },
    ],
    ...overrides,
  };
}

function expectReadinessError(error, code) {
  assert.ok(error instanceof PreviewReadinessError);
  assert.equal(error.code, code);
  return true;
}

function htmlResponse(body = '<html><body>ok</body></html>', status = 200) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function imageResponse(status = 200) {
  return new Response('image-bytes', {
    status,
    headers: { 'content-type': 'image/jpeg' },
  });
}

function createSmokeFetch(overrides = {}) {
  return async (url) => {
    const path = new URL(url).pathname;
    if (path in overrides) return overrides[path];
    if (DEFAULT_HTML_ROUTES.includes(path)) return htmlResponse();
    if (path === DEFAULT_ASSET_PATH) return imageResponse();
    if (path === DEFAULT_MISSING_PATH || path === DEFAULT_BASE_LEAK_PATH) {
      return htmlResponse('not found', 404);
    }
    return htmlResponse('not found', 404);
  };
}

test('waits through retryable Vercel state and resolves exact-head evidence', async () => {
  let calls = 0;
  let clock = 0;
  const result = await waitForPreviewEvidence({
    expectedHeadSha: HEAD,
    timeoutMs: 100,
    pollIntervalMs: 10,
    now: () => clock,
    sleepFn: async (milliseconds) => {
      clock += milliseconds;
    },
    loadEvidence: async () => {
      calls += 1;
      if (calls === 1) {
        return evidenceInput({
          statuses: [
            {
              context: 'Vercel',
              state: 'pending',
              target_url: INSPECTOR,
            },
          ],
        });
      }
      return evidenceInput();
    },
  });

  assert.equal(calls, 2);
  assert.equal(result.headSha, HEAD);
  assert.equal(result.previewUrl, PREVIEW);
});

test('fails immediately when the live PR head becomes stale', async () => {
  await assert.rejects(
    () =>
      waitForPreviewEvidence({
        expectedHeadSha: HEAD,
        loadEvidence: async () =>
          evidenceInput({
            liveHeadSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          }),
      }),
    (error) => {
      assert.equal(error.code, 'STALE_HEAD');
      return true;
    },
  );
});

test('fails immediately on terminal Vercel provider failure', async () => {
  await assert.rejects(
    () =>
      waitForPreviewEvidence({
        expectedHeadSha: HEAD,
        loadEvidence: async () =>
          evidenceInput({
            statuses: [
              {
                context: 'Vercel',
                state: 'failure',
                target_url: INSPECTOR,
              },
            ],
          }),
      }),
    (error) => {
      assert.equal(error.code, 'VERCEL_STATUS_FAILED');
      return true;
    },
  );
});

test('bounds polling and reports exact-head Vercel timeout', async () => {
  let clock = 0;
  await assert.rejects(
    () =>
      waitForPreviewEvidence({
        expectedHeadSha: HEAD,
        timeoutMs: 20,
        pollIntervalMs: 10,
        now: () => clock,
        sleepFn: async (milliseconds) => {
          clock += milliseconds;
        },
        loadEvidence: async () =>
          evidenceInput({
            statuses: [
              {
                context: 'Vercel',
                state: 'pending',
                target_url: INSPECTOR,
              },
            ],
          }),
      }),
    (error) => expectReadinessError(error, 'VERCEL_EVIDENCE_TIMEOUT'),
  );
});

test('loads live PR head, current-head statuses and official comments from GitHub', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    const path = new URL(url).pathname;
    if (path.endsWith('/pulls/108')) {
      return Response.json({ head: { sha: HEAD } });
    }
    if (path.endsWith(`/commits/${HEAD}/status`)) {
      return Response.json({ statuses: evidenceInput().statuses });
    }
    if (path.endsWith('/issues/108/comments')) {
      return Response.json(evidenceInput().comments);
    }
    return Response.json({ message: 'unexpected' }, { status: 404 });
  };

  const result = await loadGitHubPreviewEvidence({
    fetchImpl,
    repository: 'owner/repo',
    prNumber: 108,
    expectedHeadSha: HEAD,
    token: 'test-token',
  });

  assert.equal(result.liveHeadSha, HEAD);
  assert.equal(result.statuses.length, 1);
  assert.equal(result.comments.length, 1);
  assert.equal(requests.length, 3);
  for (const request of requests) {
    assert.equal(request.options.headers.Authorization, 'Bearer test-token');
  }
});

test('fails GitHub evidence loading with an actionable permission error', async () => {
  await assert.rejects(
    () =>
      loadGitHubPreviewEvidence({
        fetchImpl: async () =>
          Response.json({ message: 'forbidden' }, { status: 403 }),
        repository: 'owner/repo',
        prNumber: 108,
        expectedHeadSha: HEAD,
        token: 'test-token',
      }),
    (error) => expectReadinessError(error, 'GITHUB_API_FAILED'),
  );
});

test('smokes current routes, a real asset and negative paths', async () => {
  const result = await smokePreview({
    previewUrl: PREVIEW,
    fetchImpl: createSmokeFetch(),
  });

  assert.deepEqual(result.checkedPaths, [
    ...DEFAULT_HTML_ROUTES,
    DEFAULT_ASSET_PATH,
    DEFAULT_MISSING_PATH,
    DEFAULT_BASE_LEAK_PATH,
  ]);
});

test('rejects a broken HTML route', async () => {
  await assert.rejects(
    () =>
      smokePreview({
        previewUrl: PREVIEW,
        fetchImpl: createSmokeFetch({ '/en/': htmlResponse('broken', 500) }),
      }),
    (error) => expectReadinessError(error, 'PREVIEW_ROUTE_FAILED'),
  );
});

test('rejects non-HTML content on page routes', async () => {
  await assert.rejects(
    () =>
      smokePreview({
        previewUrl: PREVIEW,
        fetchImpl: createSmokeFetch({
          '/proyectos/': new Response('{}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        }),
      }),
    (error) => expectReadinessError(error, 'PREVIEW_CONTENT_TYPE_INVALID'),
  );
});

test('rejects GitHub Pages /PORTFOLIO path leakage in preview markup', async () => {
  await assert.rejects(
    () =>
      smokePreview({
        previewUrl: PREVIEW,
        fetchImpl: createSmokeFetch({
          '/': htmlResponse('<a href="/PORTFOLIO/proyectos/">Projects</a>'),
        }),
      }),
    (error) => expectReadinessError(error, 'PREVIEW_BASE_PATH_LEAK'),
  );
});

test('rejects a provider fallback that masks missing routes as successful HTML', async () => {
  await assert.rejects(
    () =>
      smokePreview({
        previewUrl: PREVIEW,
        fetchImpl: createSmokeFetch({
          [DEFAULT_MISSING_PATH]: htmlResponse('fallback', 200),
        }),
      }),
    (error) => expectReadinessError(error, 'PREVIEW_FALLBACK_MASKING'),
  );
});

test('rejects a live /PORTFOLIO/ path on Vercel Preview', async () => {
  await assert.rejects(
    () =>
      smokePreview({
        previewUrl: PREVIEW,
        fetchImpl: createSmokeFetch({
          [DEFAULT_BASE_LEAK_PATH]: htmlResponse('wrong base', 200),
        }),
      }),
    (error) => expectReadinessError(error, 'PREVIEW_BASE_PATH_LEAK'),
  );
});

test('detects deployment protection from HTTP denial', async () => {
  await assert.rejects(
    () =>
      fetchPreviewResource(
        async () => new Response('forbidden', { status: 403 }),
        PREVIEW,
      ),
    (error) => expectReadinessError(error, 'PREVIEW_PROTECTED'),
  );
});

test('detects deployment protection redirects to Vercel control infrastructure', async () => {
  await assert.rejects(
    () =>
      fetchPreviewResource(
        async () =>
          new Response(null, {
            status: 307,
            headers: { location: 'https://vercel.com/login' },
          }),
        PREVIEW,
      ),
    (error) => expectReadinessError(error, 'PREVIEW_PROTECTED'),
  );
});

test('allows bounded same-host redirects', async () => {
  let calls = 0;
  const response = await fetchPreviewResource(async () => {
    calls += 1;
    if (calls === 1) {
      return new Response(null, {
        status: 308,
        headers: { location: '/en/' },
      });
    }
    return htmlResponse();
  }, `${PREVIEW}en`);

  assert.equal(response.status, 200);
  assert.equal(calls, 2);
});

test('revalidates exact-head provider evidence after deployed smoke', async () => {
  let evidenceCalls = 0;
  const result = await runPreviewReadiness({
    expectedHeadSha: HEAD,
    fetchImpl: createSmokeFetch(),
    loadEvidence: async () => {
      evidenceCalls += 1;
      return evidenceInput();
    },
  });

  assert.equal(evidenceCalls, 2);
  assert.equal(result.evidence.headSha, HEAD);
  assert.ok(result.smoke.checkedPaths.includes('/cv/'));
});

test('fails closed if Vercel deployment evidence changes during smoke', async () => {
  let evidenceCalls = 0;
  await assert.rejects(
    () =>
      runPreviewReadiness({
        expectedHeadSha: HEAD,
        fetchImpl: createSmokeFetch(),
        loadEvidence: async () => {
          evidenceCalls += 1;
          if (evidenceCalls === 1) return evidenceInput();
          const nextInspector =
            'https://vercel.com/example-team/portfolio/AnotherDeployment1234567890';
          const nextPreview = 'https://portfolio-git-next.vercel.app/';
          return evidenceInput({
            statuses: [
              {
                context: 'Vercel',
                state: 'success',
                target_url: nextInspector,
              },
            ],
            comments: [
              {
                id: 2,
                user: { login: 'vercel[bot]', type: 'Bot' },
                body: `[Ready](${nextInspector}) [Preview](${nextPreview})`,
              },
            ],
          });
        },
      }),
    (error) => expectReadinessError(error, 'VERCEL_EVIDENCE_CHANGED'),
  );
});

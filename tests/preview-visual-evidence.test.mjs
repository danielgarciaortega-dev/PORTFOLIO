import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PREVIEW_VISUAL_SURFACES,
  PREVIEW_VISUAL_VIEWPORTS,
  buildPreviewRequestHeaders,
  createVisualEvidenceManifest,
  isExactPreviewHostRequest,
  parseValidatedPreviewUrl,
  validateHeadSha,
} from '../scripts/lib/preview-visual-evidence.mjs';

const PREVIEW = 'https://portfolio-git-example.vercel.app/';
const HEAD = 'a'.repeat(40);
const SECRET = 'test-bypass-secret';

test('accepts only protected-preview compatible HTTPS vercel.app hosts', () => {
  assert.equal(parseValidatedPreviewUrl(PREVIEW).href, PREVIEW);

  for (const invalid of [
    'http://portfolio-git-example.vercel.app/',
    'https://vercel.app/',
    'https://vercel.app.evil.example/',
    'https://portfolio-git-example.vercel.app.evil.example/',
    'https://user:pass@portfolio-git-example.vercel.app/',
    'not-a-url',
  ]) {
    assert.throws(() => parseValidatedPreviewUrl(invalid));
  }
});

test('restricts bypass requests to the exact validated Preview origin', () => {
  assert.equal(
    isExactPreviewHostRequest(
      'https://portfolio-git-example.vercel.app/_astro/app.js',
      PREVIEW,
    ),
    true,
  );

  for (const requestUrl of [
    'https://other-preview.vercel.app/',
    'https://vercel.com/login',
    'https://portfolio-git-example.vercel.app.evil.example/',
    'http://portfolio-git-example.vercel.app/',
  ]) {
    assert.equal(isExactPreviewHostRequest(requestUrl, PREVIEW), false);
  }
});

test('injects the protection secret only for the exact Preview origin', () => {
  const sameHost = buildPreviewRequestHeaders(
    `${PREVIEW}_astro/app.js`,
    PREVIEW,
    { accept: 'text/html' },
    SECRET,
  );
  assert.equal(sameHost.accept, 'text/html');
  assert.equal(sameHost['x-vercel-protection-bypass'], SECRET);

  const foreignHost = buildPreviewRequestHeaders(
    'https://cdn.example.com/app.js',
    PREVIEW,
    { accept: '*/*' },
    SECRET,
  );
  assert.equal(foreignHost.accept, '*/*');
  assert.equal('x-vercel-protection-bypass' in foreignHost, false);
});

test('keeps the #93 viewport and bilingual surface contract explicit', () => {
  assert.deepEqual(
    PREVIEW_VISUAL_VIEWPORTS.map((viewport) => viewport.name),
    ['390x844', '768x1024', '1440x900', '1920x1080'],
  );
  assert.deepEqual(
    PREVIEW_VISUAL_SURFACES.map((surface) => [surface.locale, surface.path]),
    [
      ['es', '/'],
      ['en', '/en/'],
    ],
  );
});

test('manifest contains review identity but cannot receive the bypass secret', () => {
  const manifest = createVisualEvidenceManifest({
    headSha: HEAD,
    previewUrl: PREVIEW,
    captures: [
      {
        locale: 'es',
        viewport: '390x844',
        file: '390x844/es-home.png',
      },
    ],
  });

  assert.equal(manifest.headSha, HEAD);
  assert.equal(manifest.previewUrl, PREVIEW);
  assert.equal(JSON.stringify(manifest).includes(SECRET), false);
  assert.equal(manifest.viewports.length, 4);
});

test('requires a full immutable commit SHA for artifact identity', () => {
  assert.equal(validateHeadSha(HEAD.toUpperCase()), HEAD);
  assert.throws(() => validateHeadSha('abc123'));
});

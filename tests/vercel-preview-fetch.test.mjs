import assert from 'node:assert/strict';
import test from 'node:test';
import { createVercelPreviewFetch } from '../scripts/lib/vercel-preview-fetch.mjs';

const PREVIEW = 'https://portfolio-git-example.vercel.app/';

test('returns the original fetch implementation when no bypass secret exists', () => {
  const fetchImpl = async () => new Response('ok');
  assert.equal(createVercelPreviewFetch(fetchImpl, undefined), fetchImpl);
  assert.equal(createVercelPreviewFetch(fetchImpl, '   '), fetchImpl);
});

test('injects the official Vercel automation bypass header only into preview fetches', async () => {
  let capturedHeaders;
  const fetchImpl = async (_input, init) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response('ok');
  };
  const previewFetch = createVercelPreviewFetch(
    fetchImpl,
    'automation-bypass-test-secret',
  );

  await previewFetch(PREVIEW, {
    headers: { Accept: 'text/html' },
  });

  assert.equal(capturedHeaders.get('accept'), 'text/html');
  assert.equal(
    capturedHeaders.get('x-vercel-protection-bypass'),
    'automation-bypass-test-secret',
  );
});

test('does not expose the bypass secret when a preview request fails', async () => {
  const secret = 'automation-bypass-test-secret';
  const previewFetch = createVercelPreviewFetch(async () => {
    throw new Error('preview network failure');
  }, secret);

  await assert.rejects(
    () => previewFetch(PREVIEW),
    (error) => {
      assert.equal(error.message, 'preview network failure');
      assert.doesNotMatch(error.message, new RegExp(secret));
      return true;
    },
  );
});

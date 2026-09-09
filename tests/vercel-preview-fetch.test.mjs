import assert from 'node:assert/strict';
import test from 'node:test';
import { createVercelPreviewFetch } from '../scripts/lib/vercel-preview-fetch.mjs';

const PREVIEW = 'https://portfolio-git-example.vercel.app/';
const SECRET = 'automation-bypass-test-secret';

test('returns the original fetch implementation when no bypass secret exists', () => {
  const fetchImpl = async () => new Response('ok');
  assert.equal(createVercelPreviewFetch(fetchImpl, undefined), fetchImpl);
  assert.equal(createVercelPreviewFetch(fetchImpl, '   '), fetchImpl);
});

test('injects the official Vercel automation bypass header on HTTPS preview requests', async () => {
  let capturedHeaders;
  const fetchImpl = async (_input, init) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response('ok');
  };
  const previewFetch = createVercelPreviewFetch(fetchImpl, SECRET);

  await previewFetch(PREVIEW, {
    headers: { Accept: 'text/html' },
  });

  assert.equal(capturedHeaders.get('accept'), 'text/html');
  assert.equal(capturedHeaders.get('x-vercel-protection-bypass'), SECRET);
});

test('supports Request inputs for exact Vercel Preview URLs', async () => {
  let capturedHeaders;
  const fetchImpl = async (_input, init) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response('ok');
  };
  const previewFetch = createVercelPreviewFetch(fetchImpl, SECRET);

  await previewFetch(new Request(PREVIEW));

  assert.equal(capturedHeaders.get('x-vercel-protection-bypass'), SECRET);
});

test('never sends the bypass secret outside HTTPS *.vercel.app preview hosts', async () => {
  const captured = [];
  const fetchImpl = async (input, init) => {
    captured.push({
      url: String(input),
      bypass: new Headers(init?.headers).get('x-vercel-protection-bypass'),
    });
    return new Response('ok');
  };
  const previewFetch = createVercelPreviewFetch(fetchImpl, SECRET);

  for (const url of [
    'https://api.github.com/repos/owner/repo',
    'https://vercel.com/example/project/deployment',
    'https://vercel.app/',
    'https://portfolio.vercel.app.example.com/',
    'http://portfolio-git-example.vercel.app/',
  ]) {
    await previewFetch(url);
  }

  assert.equal(captured.length, 5);
  for (const request of captured) {
    assert.equal(request.bypass, null, request.url);
  }
});

test('does not expose the bypass secret when a preview request fails', async () => {
  const previewFetch = createVercelPreviewFetch(async () => {
    throw new Error('preview network failure');
  }, SECRET);

  await assert.rejects(
    () => previewFetch(PREVIEW),
    (error) => {
      assert.equal(error.message, 'preview network failure');
      assert.doesNotMatch(error.message, new RegExp(SECRET));
      return true;
    },
  );
});

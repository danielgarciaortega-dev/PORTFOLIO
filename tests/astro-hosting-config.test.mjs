import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeBase,
  resolveHostingConfig,
} from '../scripts/lib/hosting-config.mjs';

test('normalizes explicit base paths consistently', () => {
  assert.equal(normalizeBase(undefined), '/');
  assert.equal(normalizeBase('/'), '/');
  assert.equal(normalizeBase('PORTFOLIO'), '/PORTFOLIO');
  assert.equal(normalizeBase('/PORTFOLIO/'), '/PORTFOLIO');
});

test('infers the GitHub Pages project-site origin and repository base', () => {
  assert.deepEqual(
    resolveHostingConfig({
      GITHUB_REPOSITORY: 'danielgarciaortega-dev/PORTFOLIO',
    }),
    {
      site: 'https://danielgarciaortega-dev.github.io',
      base: '/PORTFOLIO',
    },
  );
});

test('infers a Vercel preview origin and root base even if GitHub metadata is also present', () => {
  assert.deepEqual(
    resolveHostingConfig({
      GITHUB_REPOSITORY: 'danielgarciaortega-dev/PORTFOLIO',
      VERCEL: '1',
      VERCEL_URL: 'portfolio-git-preview-example.vercel.app',
      VERCEL_GIT_COMMIT_SHA: '0123456789abcdef',
    }),
    {
      site: 'https://portfolio-git-preview-example.vercel.app',
      base: '/',
    },
  );
});

test('explicit site and base overrides take precedence over provider inference', () => {
  assert.deepEqual(
    resolveHostingConfig({
      SITE_URL: 'https://preview.example.test',
      BASE_PATH: '/custom/base/',
      GITHUB_REPOSITORY: 'danielgarciaortega-dev/PORTFOLIO',
      VERCEL: '1',
      VERCEL_URL: 'ignored-preview.vercel.app',
    }),
    {
      site: 'https://preview.example.test',
      base: '/custom/base',
    },
  );
});

test('preserves local defaults without provider metadata', () => {
  assert.deepEqual(resolveHostingConfig({}), {
    site: 'http://localhost:4321',
    base: '/',
  });
});

test('fails closed when Vercel is detected but no deployment origin can be resolved', () => {
  assert.throws(
    () => resolveHostingConfig({ VERCEL: '1' }),
    /VERCEL_URL is required when VERCEL=1/,
  );
});

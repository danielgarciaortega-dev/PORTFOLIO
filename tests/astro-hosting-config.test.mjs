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

test('uses root base for a GitHub Pages user-site repository', () => {
  assert.deepEqual(
    resolveHostingConfig({
      GITHUB_REPOSITORY:
        'danielgarciaortega-dev/danielgarciaortega-dev.github.io',
    }),
    {
      site: 'https://danielgarciaortega-dev.github.io',
      base: '/',
    },
  );
});

test('explicit site and base overrides take precedence over Pages inference', () => {
  assert.deepEqual(
    resolveHostingConfig({
      SITE_URL: 'https://local.example.test',
      BASE_PATH: '/custom/base/',
      GITHUB_REPOSITORY: 'danielgarciaortega-dev/PORTFOLIO',
    }),
    {
      site: 'https://local.example.test',
      base: '/custom/base',
    },
  );
});

test('preserves local defaults without GitHub repository metadata', () => {
  assert.deepEqual(resolveHostingConfig({}), {
    site: 'http://localhost:4321',
    base: '/',
  });
});

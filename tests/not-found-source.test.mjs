import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pageSource = await readFile(new URL('../src/pages/404.astro', import.meta.url), 'utf8');
const runtimeSource = await readFile(
  new URL('../src/scripts/not-found-locale.ts', import.meta.url),
  'utf8',
);

test('404 localization stays single-source and pathname-driven', () => {
  assert.match(pageSource, /dialogCopy, notFoundCopy, shellCopy/);
  assert.match(pageSource, /getProfessionalData/);
  assert.match(pageSource, /id="not-found-locale-data"/);
  assert.doesNotMatch(pageSource, /This route is not part of the project/);
  assert.match(runtimeSource, /window\.location\.pathname/);
  assert.match(runtimeSource, /resolveLocaleFromPathname/);
});

test('404 localization does not introduce redirect or SPA fallback behavior', () => {
  assert.doesNotMatch(runtimeSource, /location\.(?:assign|replace)/);
  assert.doesNotMatch(runtimeSource, /history\.(?:pushState|replaceState)/);
  assert.doesNotMatch(runtimeSource, /fetch\(/);
  assert.doesNotMatch(pageSource, /\/en\/404\//);
});

test('404 renders one interactive shell and one action set', () => {
  assert.equal((pageSource.match(/<AboutDialog\s*\/>/g) ?? []).length, 1);
  assert.equal((pageSource.match(/data-not-found-actions/g) ?? []).length, 1);
  assert.equal((pageSource.match(/<h1\b/g) ?? []).length, 1);
});

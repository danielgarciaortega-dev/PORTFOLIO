import { expect, test } from '@playwright/test';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const obsoleteSelector = 'overview-organization__logo';

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
    }),
  );

  return files.flat();
}

test('obsolete overview logo selector stays retired from runtime source', async () => {
  const sourceFiles = await collectFiles('src');

  for (const file of sourceFiles) {
    const source = await readFile(file, 'utf8');
    expect(source, `${file} must not revive ${obsoleteSelector}`).not.toContain(
      obsoleteSelector,
    );
  }
});

test('overview logos keep using the shared project mark contract', async () => {
  const css = await readFile('src/styles/global.css', 'utf8');
  const geometryGuard = await readFile(
    'tests/overview-logo-geometry.spec.ts',
    'utf8',
  );

  expect(css).toContain('.project-preview__mark {');
  expect(css).toContain('.project-preview__mark img {');
  expect(geometryGuard).toContain(
    ".overview-organization .project-preview__mark",
  );
});

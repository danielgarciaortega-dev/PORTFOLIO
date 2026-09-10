import { expect, test } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const runtimeRoot = path.resolve('src');

async function collectRuntimeSources(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectRuntimeSources(entryPath)));
      continue;
    }

    if (/\.(astro|css|ts)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

test('retired project preview open selector stays absent from runtime source', async () => {
  const sourceFiles = await collectRuntimeSources(runtimeRoot);
  const sources = await Promise.all(
    sourceFiles.map(async (filePath) => ({
      filePath,
      content: await readFile(filePath, 'utf8'),
    })),
  );

  const legacyReferences = sources.filter(({ content }) =>
    content.includes('project-preview__open'),
  );

  expect(
    legacyReferences.map(({ filePath }) =>
      path.relative(process.cwd(), filePath),
    ),
  ).toEqual([]);

  const component = await readFile(
    path.join(runtimeRoot, 'components/projects/ProjectPreview.astro'),
    'utf8',
  );
  const css = await readFile(
    path.join(runtimeRoot, 'styles/global.css'),
    'utf8',
  );

  expect(component).toContain('project-preview__button');
  expect(component).toContain('project-preview__arrow');
  expect(css).toContain('.project-preview__button');
  expect(css).toContain('.project-preview__arrow');
});

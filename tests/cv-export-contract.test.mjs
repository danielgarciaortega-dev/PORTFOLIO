import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  CV_EXPORTS,
  exportCvDocuments,
  resolveCvExports,
} from '../scripts/lib/cv-export.mjs';

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-cv-export-'));
  const definitions = resolveCvExports(root);

  for (const definition of definitions) {
    await mkdir(path.dirname(definition.sourcePath), { recursive: true });
    await writeFile(
      definition.sourcePath,
      `<html lang="${definition.locale}"><body>${definition.locale}</body></html>`,
    );
    await writeFile(definition.outputPath, `stale-${definition.locale}`);
  }

  return { root, definitions };
}

function createFakeLauncher({ failLocale = null } = {}) {
  const state = {
    browserClosed: false,
    launches: 0,
    pdfOptions: [],
  };

  const launchBrowser = async () => {
    state.launches += 1;
    return {
      async newPage() {
        let sourcePath = '';
        return {
          async goto(url) {
            sourcePath = fileURLToPath(url);
          },
          async evaluate() {},
          async pdf(options) {
            const locale = sourcePath.includes(`${path.sep}en${path.sep}cv${path.sep}`)
              ? 'en'
              : 'es';
            state.pdfOptions.push({ locale, ...options });
            if (locale === failLocale) {
              throw new Error(`simulated ${locale} render failure`);
            }
            await writeFile(options.path, `%PDF-fresh-${locale}`);
          },
          async close() {},
        };
      },
      async close() {
        state.browserClosed = true;
      },
    };
  };

  return { launchBrowser, state };
}

async function assertNoTransients(definitions) {
  for (const definition of definitions) {
    await assert.rejects(readFile(`${definition.outputPath}.tmp`));
    await assert.rejects(readFile(`${definition.outputPath}.bak`));
  }
}

test('dual CV definitions keep explicit locale source/output pairs', () => {
  assert.deepEqual(CV_EXPORTS, [
    {
      locale: 'es',
      sourceSegments: ['public', 'cv', 'index.html'],
      outputSegments: ['public', 'cv', 'CV-Daniel-Garcia-Ortega.pdf'],
    },
    {
      locale: 'en',
      sourceSegments: ['public', 'en', 'cv', 'index.html'],
      outputSegments: [
        'public',
        'en',
        'cv',
        'CV-Daniel-Garcia-Ortega-EN.pdf',
      ],
    },
  ]);
});

test('successful dual export replaces both canonical targets and cleans transients', async () => {
  const { root, definitions } = await createFixture();
  const { launchBrowser, state } = createFakeLauncher();

  try {
    await exportCvDocuments({ definitions, launchBrowser, logger: () => {} });

    assert.equal(await readFile(definitions[0].outputPath, 'utf8'), '%PDF-fresh-es');
    assert.equal(await readFile(definitions[1].outputPath, 'utf8'), '%PDF-fresh-en');
    assert.equal(state.launches, 1);
    assert.equal(state.browserClosed, true);
    assert.deepEqual(
      state.pdfOptions.map(({ locale, printBackground, preferCSSPageSize }) => ({
        locale,
        printBackground,
        preferCSSPageSize,
      })),
      [
        { locale: 'es', printBackground: true, preferCSSPageSize: true },
        { locale: 'en', printBackground: true, preferCSSPageSize: true },
      ],
    );
    await assertNoTransients(definitions);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('missing source fails before browser launch and cannot be masked by stale PDFs', async () => {
  const { root, definitions } = await createFixture();
  const { launchBrowser, state } = createFakeLauncher();

  try {
    await rm(definitions[1].sourcePath);
    await assert.rejects(
      exportCvDocuments({ definitions, launchBrowser, logger: () => {} }),
    );
    assert.equal(state.launches, 0);
    assert.equal(await readFile(definitions[0].outputPath, 'utf8'), 'stale-es');
    assert.equal(await readFile(definitions[1].outputPath, 'utf8'), 'stale-en');
    await assertNoTransients(definitions);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

for (const failingLocale of ['es', 'en']) {
  test(`${failingLocale} render failure publishes neither locale and closes Chromium`, async () => {
    const { root, definitions } = await createFixture();
    const { launchBrowser, state } = createFakeLauncher({
      failLocale: failingLocale,
    });

    try {
      await assert.rejects(
        exportCvDocuments({ definitions, launchBrowser, logger: () => {} }),
        new RegExp(`simulated ${failingLocale} render failure`),
      );
      assert.equal(await readFile(definitions[0].outputPath, 'utf8'), 'stale-es');
      assert.equal(await readFile(definitions[1].outputPath, 'utf8'), 'stale-en');
      assert.equal(state.browserClosed, true);
      await assertNoTransients(definitions);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
}

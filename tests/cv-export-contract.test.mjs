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

function definitionKey(definition) {
  return `${definition.locale}:${definition.variant}`;
}

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-cv-export-'));
  const definitions = resolveCvExports(root);

  for (const definition of definitions) {
    const key = definitionKey(definition);
    const html = `<html lang="${definition.locale}"><body>${key}</body></html>`;

    await mkdir(path.dirname(definition.sourcePath), { recursive: true });
    await writeFile(definition.sourcePath, html);
    await writeFile(definition.outputPath, `stale-${key}`);
  }

  return { root, definitions };
}

function createFakeLauncher({ definitions, failKey = null } = {}) {
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
            const definition = definitions.find(
              (candidate) => candidate.sourcePath === sourcePath,
            );
            assert.ok(definition, `Unknown CV source path: ${sourcePath}`);

            const key = definitionKey(definition);
            state.pdfOptions.push({ key, ...options });

            if (key === failKey) {
              throw new Error(`simulated ${key} render failure`);
            }

            await writeFile(options.path, `%PDF-fresh-${key}`);
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

async function assertStaleOutputs(definitions) {
  for (const definition of definitions) {
    assert.equal(
      await readFile(definition.outputPath, 'utf8'),
      `stale-${definitionKey(definition)}`,
    );
  }
}

test('CV export config defines four unique outputs', () => {
  assert.deepEqual(CV_EXPORTS, [
    {
      locale: 'es',
      variant: 'designed',
      sourceSegments: ['public', 'cv', 'index.html'],
      outputSegments: ['public', 'cv', 'CV-Daniel-Garcia-Ortega.pdf'],
    },
    {
      locale: 'en',
      variant: 'designed',
      sourceSegments: ['public', 'en', 'cv', 'index.html'],
      outputSegments: ['public', 'en', 'cv', 'CV-Daniel-Garcia-Ortega-EN.pdf'],
    },
    {
      locale: 'es',
      variant: 'ats',
      sourceSegments: ['public', 'cv', 'ats', 'index.html'],
      outputSegments: [
        'public',
        'cv',
        'ats',
        'CV-Daniel-Garcia-Ortega-ATS.pdf',
      ],
    },
    {
      locale: 'en',
      variant: 'ats',
      sourceSegments: ['public', 'en', 'cv', 'ats', 'index.html'],
      outputSegments: [
        'public',
        'en',
        'cv',
        'ats',
        'CV-Daniel-Garcia-Ortega-ATS-EN.pdf',
      ],
    },
  ]);

  const resolved = resolveCvExports('/tmp/example');
  assert.equal(new Set(resolved.map(({ sourcePath }) => sourcePath)).size, 4);
  assert.equal(new Set(resolved.map(({ outputPath }) => outputPath)).size, 4);
});

test('four-way export replaces outputs and cleans temp files', async () => {
  const { root, definitions } = await createFixture();
  const { launchBrowser, state } = createFakeLauncher({ definitions });
  const logs = [];

  try {
    await exportCvDocuments({
      definitions,
      launchBrowser,
      logger: (message) => logs.push(message),
    });

    for (const definition of definitions) {
      assert.equal(
        await readFile(definition.outputPath, 'utf8'),
        `%PDF-fresh-${definitionKey(definition)}`,
      );
    }

    assert.equal(state.launches, 1);
    assert.equal(state.browserClosed, true);
    assert.deepEqual(
      state.pdfOptions.map(({ key, printBackground, preferCSSPageSize }) => ({
        key,
        printBackground,
        preferCSSPageSize,
      })),
      [
        {
          key: 'es:designed',
          printBackground: true,
          preferCSSPageSize: true,
        },
        {
          key: 'en:designed',
          printBackground: true,
          preferCSSPageSize: true,
        },
        { key: 'es:ats', printBackground: true, preferCSSPageSize: true },
        { key: 'en:ats', printBackground: true, preferCSSPageSize: true },
      ],
    );
    assert.equal(logs.length, 4);
    assert.match(logs[0], /CV ES DESIGNED exported/);
    assert.match(logs[1], /CV EN DESIGNED exported/);
    assert.match(logs[2], /CV ES ATS exported/);
    assert.match(logs[3], /CV EN ATS exported/);
    await assertNoTransients(definitions);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('duplicate outputs fail before browser launch', async () => {
  const { root, definitions } = await createFixture();
  const duplicatedDefinitions = definitions.map((definition) => ({
    ...definition,
  }));
  duplicatedDefinitions[3].outputPath = duplicatedDefinitions[2].outputPath;
  const { launchBrowser, state } = createFakeLauncher({
    definitions: duplicatedDefinitions,
  });

  try {
    await assert.rejects(
      exportCvDocuments({
        definitions: duplicatedDefinitions,
        launchBrowser,
        logger: () => {},
      }),
      /output paths must be unique/,
    );
    assert.equal(state.launches, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('missing ATS source cannot be masked by stale PDFs', async () => {
  const { root, definitions } = await createFixture();
  const { launchBrowser, state } = createFakeLauncher({ definitions });

  try {
    await rm(definitions[3].sourcePath);
    await assert.rejects(
      exportCvDocuments({ definitions, launchBrowser, logger: () => {} }),
    );
    assert.equal(state.launches, 0);
    await assertStaleOutputs(definitions);
    await assertNoTransients(definitions);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

for (const failKey of ['es:designed', 'en:designed', 'es:ats', 'en:ats']) {
  test(`${failKey} render failure is fail-closed`, async () => {
    const { root, definitions } = await createFixture();
    const { launchBrowser, state } = createFakeLauncher({
      definitions,
      failKey,
    });

    try {
      await assert.rejects(
        exportCvDocuments({ definitions, launchBrowser, logger: () => {} }),
        new RegExp(`simulated ${failKey} render failure`),
      );
      await assertStaleOutputs(definitions);
      assert.equal(state.browserClosed, true);
      await assertNoTransients(definitions);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
}

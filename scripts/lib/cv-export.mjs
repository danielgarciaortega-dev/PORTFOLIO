import {
  access,
  copyFile,
  mkdir,
  rename,
  rm,
  stat,
} from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const CV_EXPORTS = [
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
];

export function resolveCvExports(root) {
  return CV_EXPORTS.map((definition) => ({
    locale: definition.locale,
    sourcePath: path.join(root, ...definition.sourceSegments),
    outputPath: path.join(root, ...definition.outputSegments),
  }));
}

function transientPaths(outputPath) {
  return {
    temporaryPath: `${outputPath}.tmp`,
    backupPath: `${outputPath}.bak`,
  };
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function assertNonEmpty(filePath, label) {
  const fileStat = await stat(filePath);
  if (!fileStat.isFile() || fileStat.size <= 0) {
    throw new Error(`${label} was not written as a non-empty file`);
  }
}

export async function exportCvDocuments({
  definitions,
  launchBrowser,
  logger = console.log,
}) {
  if (!Array.isArray(definitions) || definitions.length === 0) {
    throw new Error('At least one CV export definition is required');
  }

  for (const definition of definitions) {
    await access(definition.sourcePath);
    await mkdir(path.dirname(definition.outputPath), { recursive: true });
    const { temporaryPath, backupPath } = transientPaths(definition.outputPath);
    await rm(temporaryPath, { force: true });
    await rm(backupPath, { force: true });
  }

  const browser = await launchBrowser();
  const prepared = [];

  try {
    for (const definition of definitions) {
      const { temporaryPath, backupPath } = transientPaths(definition.outputPath);
      const page = await browser.newPage();

      try {
        await page.goto(pathToFileURL(definition.sourcePath).href, {
          waitUntil: 'networkidle',
        });
        await page.evaluate(() => document.fonts.ready);
        await page.pdf({
          path: temporaryPath,
          printBackground: true,
          preferCSSPageSize: true,
        });
        await assertNonEmpty(temporaryPath, `CV ${definition.locale}`);
      } finally {
        await page.close();
      }

      prepared.push({ ...definition, temporaryPath, backupPath });
    }

    const backedUp = [];
    const published = [];

    try {
      for (const definition of prepared) {
        if (await exists(definition.outputPath)) {
          await copyFile(definition.outputPath, definition.backupPath);
          backedUp.push(definition);
        }
      }

      for (const definition of prepared) {
        await rename(definition.temporaryPath, definition.outputPath);
        published.push(definition);
      }

      for (const definition of prepared) {
        await assertNonEmpty(definition.outputPath, `Published CV ${definition.locale}`);
      }
    } catch (error) {
      for (const definition of published) {
        const backup = backedUp.find(
          (candidate) => candidate.outputPath === definition.outputPath,
        );
        if (backup) {
          await copyFile(backup.backupPath, definition.outputPath);
        } else {
          await rm(definition.outputPath, { force: true });
        }
      }
      throw error;
    } finally {
      for (const definition of prepared) {
        await rm(definition.temporaryPath, { force: true });
      }
    }

    for (const definition of prepared) {
      await rm(definition.backupPath, { force: true });
      logger(
        `CV ${definition.locale.toUpperCase()} exported to ${definition.outputPath}`,
      );
    }
  } finally {
    for (const definition of definitions) {
      const { temporaryPath } = transientPaths(definition.outputPath);
      await rm(temporaryPath, { force: true });
    }
    await browser.close();
  }
}

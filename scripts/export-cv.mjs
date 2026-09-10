import { chromium } from '@playwright/test';
import { exportCvDocuments, resolveCvExports } from './lib/cv-export.mjs';

const root = process.cwd();

await exportCvDocuments({
  definitions: resolveCvExports(root),
  launchBrowser: () => chromium.launch(),
});

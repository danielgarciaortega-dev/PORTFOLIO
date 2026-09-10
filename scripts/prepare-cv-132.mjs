import { readFile, writeFile } from 'node:fs/promises';

async function updateRequired(path, transform) {
  const source = await readFile(path, 'utf8');
  const result = transform(source);
  if (result === source) throw new Error(`No expected change applied to ${path}`);
  await writeFile(path, result, 'utf8');
}

await updateRequired('public/en/cv/index.html', (source) => {
  const marker = '    <script>\n      const originalTitle = document.title;';
  if (!source.includes(marker)) throw new Error('English CV script marker not found');
  const download = `    <nav class="cv-page-landmark" aria-label="CV actions">\n      <a\n        class="download-btn"\n        href="CV-Daniel-Garcia-Ortega-EN.pdf"\n        download\n        aria-label="Download Daniel García Ortega CV as PDF"\n      >\n        <i class="fas fa-download" aria-hidden="true"></i>\n        Download PDF\n      </a>\n    </nav>\n`;
  return source.replace(marker, `${download}${marker}`);
});

await updateRequired('package.json', (source) =>
  source.replace(
    'node --test tests/astro-hosting-config.test.mjs tests/github-pages-policy.test.mjs',
    'node --test tests/astro-hosting-config.test.mjs tests/github-pages-policy.test.mjs tests/cv-export-contract.test.mjs',
  ),
);

await updateRequired('tests/cv-baseline.spec.ts', (source) => {
  const oldBlock = `test('Spanish CV exporter and stylesheet keep the frozen source contract', async () => {\n  const exporter = await readRepositoryFile('scripts/export-cv.mjs');\n  const styles = await readRepositoryFile('public/cv/styles.css');\n\n  expect(exporter).toContain("path.join(root, 'public', 'cv', 'index.html')");\n  expect(exporter).toContain("'CV-Daniel-Garcia-Ortega.pdf'");\n  expect(exporter).toContain('printBackground: true');\n  expect(exporter).toContain('preferCSSPageSize: true');\n  expect(exporter).toContain('document.fonts.ready');\n  expect(exporter).toMatch(/finally\\s*\\{/);\n  expect(exporter).toContain('await browser.close()');\n`;
  const newBlock = `test('Spanish CV exporter and stylesheet keep the frozen source contract', async () => {\n  const exporter = await readRepositoryFile('scripts/export-cv.mjs');\n  const exportContract = await readRepositoryFile('scripts/lib/cv-export.mjs');\n  const styles = await readRepositoryFile('public/cv/styles.css');\n\n  expect(exporter).toContain('resolveCvExports(root)');\n  expect(exporter).toContain('exportCvDocuments');\n  expect(exportContract).toContain("sourceSegments: ['public', 'cv', 'index.html']");\n  expect(exportContract).toContain("outputSegments: ['public', 'cv', 'CV-Daniel-Garcia-Ortega.pdf']");\n  expect(exportContract).toContain('printBackground: true');\n  expect(exportContract).toContain('preferCSSPageSize: true');\n  expect(exportContract).toContain('document.fonts.ready');\n  expect(exportContract).toMatch(/finally\\s*\\{/);\n  expect(exportContract).toContain('await browser.close()');\n`;
  if (!source.includes(oldBlock)) throw new Error('Frozen exporter assertion block not found');
  return source.replace(oldBlock, newBlock);
});

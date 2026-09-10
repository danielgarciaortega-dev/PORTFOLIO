import { readFile, writeFile } from 'node:fs/promises';

for (const [path, stylesheet] of [
  ['public/cv/index.html', 'locale-controls.css'],
  ['public/en/cv/index.html', '../../cv/locale-controls.css'],
]) {
  const source = await readFile(path, 'utf8');
  const marker = path.includes('/en/')
    ? '<link rel="stylesheet" href="../../cv/styles.css">'
    : '<link rel="stylesheet" href="styles.css">';
  if (!source.includes(marker)) throw new Error(`Missing stylesheet marker in ${path}`);
  const linked = source.replace(
    marker,
    `${marker}\n    <link rel="stylesheet" href="${stylesheet}">`,
  );
  await writeFile(path, linked, 'utf8');
}

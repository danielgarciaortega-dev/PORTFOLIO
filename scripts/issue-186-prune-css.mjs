import { readFile, writeFile } from 'node:fs/promises';

const file = 'src/styles/global.css';
let css = await readFile(file, 'utf8');

function replaceOnce(before, after, label) {
  const first = css.indexOf(before);
  if (first < 0) {
    throw new Error(`Missing expected CSS fragment: ${label}`);
  }
  if (css.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected exactly one CSS fragment: ${label}`);
  }
  css = css.replace(before, after);
}

replaceOnce(
  `.eyebrow {\n  margin-bottom: 0.9rem;\n  color: var(--color-brand-hover);\n  font-size: 0.76rem;\n  font-weight: 800;\n  letter-spacing: 0.16em;\n  line-height: 1.25;\n  text-transform: uppercase;\n}`,
  `.eyebrow {\n  margin-bottom: 0.9rem;\n  color: var(--color-brand-hover);\n  line-height: 1.25;\n  text-transform: uppercase;\n}`,
  'legacy eyebrow typography',
);

replaceOnce(
  `.site-header__inner {\n  width: min(100%, calc(var(--max-width) + (var(--page-padding) * 2)));\n  height: 100%;`,
  `.site-header__inner {\n  height: 100%;`,
  'legacy site-header width',
);

replaceOnce(
  `.mobile-menu__head p {\n  margin: 0;\n  color: var(--color-text-muted);\n  font-size: 0.76rem;\n  font-weight: 800;\n  letter-spacing: 0.16em;\n  text-transform: uppercase;\n}`,
  `.mobile-menu__head p {\n  margin: 0;\n  color: var(--color-text-muted);\n  text-transform: uppercase;\n}`,
  'legacy mobile-menu kicker typography',
);

replaceOnce(
  `  color: #176a48;\n  font-size: 0.87rem;`,
  `  font-size: 0.87rem;`,
  'legacy availability color',
);

replaceOnce(
  `.button-link--primary:hover {\n  background: #b43f1d;\n  transform: translateY(-2px);\n}`,
  `.button-link--primary:hover {\n  transform: translateY(-2px);\n}`,
  'legacy primary hover color',
);

replaceOnce(
  `.project-preview__number {\n  color: var(--color-brand-hover);\n  font-size: 0.66rem;\n  font-weight: 800;\n  letter-spacing: 0.08em;\n}\n\n`,
  '',
  'obsolete project preview number',
);

replaceOnce(
  `.project-preview__mark--sidn-cost-control {\n  background: #fff0df;\n}\n\n`,
  '',
  'legacy SIDN preview mark color',
);

replaceOnce(
  `.project-preview__body p {\n  margin: 0 0 0.25rem;\n  overflow: hidden;\n  color: var(--color-text-muted);\n  font-size: 0.67rem;\n  font-weight: 700;\n  letter-spacing: 0.06em;\n  text-overflow: ellipsis;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n\n`,
  '',
  'obsolete project preview paragraph',
);

replaceOnce(
  `.project-preview__body h3 {\n  margin: 0 0 0.35rem;\n  font-size: 1.06rem;\n  letter-spacing: -0.025em;\n}\n\n`,
  '',
  'obsolete project preview heading',
);

replaceOnce(
  `.contact .eyebrow {\n  color: #f3b28e;\n}\n\n`,
  '',
  'legacy contact eyebrow color',
);

replaceOnce(
  `  min-height: 1.2em;\n  color: #176a48;\n  font-size: 0.85rem;`,
  `  min-height: 1.2em;\n  font-size: 0.85rem;`,
  'legacy copy status color',
);

replaceOnce(
  `  background: var(--color-accent-soft);\n  color: #93421f;\n  font-size: 0.72rem;`,
  `  background: var(--color-accent-soft);\n  font-size: 0.72rem;`,
  'legacy award color',
);

replaceOnce(
  `  background: var(--color-accent-soft);\n  color: #93421f;\n  font-size: 0.68rem;`,
  `  background: var(--color-accent-soft);\n  font-size: 0.68rem;`,
  'legacy project meta color',
);

replaceOnce(
  `.home-page .hero__grid {\n  width: min(100%, 1536px);\n  min-height: 0;`,
  `.home-page .hero__grid {\n  min-height: 0;`,
  'legacy home hero width',
);

replaceOnce(
  `.home-overview__inner {\n  width: min(100%, 1536px);\n  min-height: 158px;`,
  `.home-overview__inner {\n  min-height: 158px;`,
  'legacy home overview width',
);

await writeFile(file, css);

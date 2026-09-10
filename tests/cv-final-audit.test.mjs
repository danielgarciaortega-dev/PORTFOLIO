import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

// Hostile variants stay in memory: the audit proves failures without altering canonical CV files.
const root = new URL('../', import.meta.url);

async function readRepositoryFile(path) {
  return readFile(new URL(path, root), 'utf8');
}

function count(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

function visibleNumericFacts(source) {
  const visibleText = source
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  return (visibleText.match(/\d[\d.,]*(?:%|€)?/g) ?? [])
    .map((value) => value.replace(/[.,]/g, ''))
    .sort();
}

function structuredFacts(source) {
  const json = source.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(json, 'Expected CV-local JSON-LD');
  const data = JSON.parse(json);

  return {
    name: data.name,
    email: data.email,
    telephone: data.telephone,
    url: data.url,
    sameAs: [...(data.sameAs ?? [])].sort(),
    knowsAbout: [...(data.knowsAbout ?? [])].sort(),
    addressLocality: data.address?.addressLocality,
    addressCountry: data.address?.addressCountry,
  };
}

function majorSectionOrder(source) {
  const classes = [
    'projects-section',
    'experience-section',
    'stack-section',
    'bottom-grid',
  ];

  return classes
    .map((className) => ({ className, index: source.indexOf(className) }))
    .sort((left, right) => left.index - right.index)
    .map(({ className }) => className);
}

function backHref(source) {
  return source.match(/class="portfolio-back-link"[\s\S]*?href="([^"]+)"/)?.[1];
}

function mutateRequired(source, pattern, replacement) {
  const result = source.replace(pattern, replacement);
  assert.notEqual(
    result,
    source,
    `Expected mutation ${String(pattern)} to apply`,
  );
  return result;
}

function assertFinalCvContract({
  es,
  en,
  styles,
  localeControls,
  englishDirectoryEntries,
}) {
  assert.equal(count(es, /data-locale-link=/g), 1);
  assert.equal(count(en, /data-locale-link=/g), 1);
  assert.match(es, /href="\.\.\/en\/cv\/"[^>]*hreflang="en"/);
  assert.match(en, /href="\.\.\/\.\.\/cv\/"[^>]*hreflang="es"/);
  assert.equal(backHref(es), '../');
  assert.equal(backHref(en), '../');

  assert.match(es, /href="CV-Daniel-Garcia-Ortega\.pdf"/);
  assert.match(en, /href="CV-Daniel-Garcia-Ortega-EN\.pdf"/);
  assert.doesNotMatch(en, /href="CV-Daniel-Garcia-Ortega\.pdf"/);

  assert.match(en, /href="\.\.\/\.\.\/cv\/styles\.css"/);
  assert.match(en, /href="\.\.\/\.\.\/cv\/locale-controls\.css"/);
  assert.match(en, /src="\.\.\/\.\.\/cv\/locale\.js"/);
  assert.deepEqual([...englishDirectoryEntries].sort(), [
    'CV-Daniel-Garcia-Ortega-EN.pdf',
    'index.html',
  ]);

  const expectedOrder = [
    'projects-section',
    'experience-section',
    'stack-section',
    'bottom-grid',
  ];
  assert.deepEqual(majorSectionOrder(es), expectedOrder);
  assert.deepEqual(majorSectionOrder(en), expectedOrder);

  assert.deepEqual(visibleNumericFacts(en), visibleNumericFacts(es));
  assert.deepEqual(structuredFacts(en), structuredFacts(es));
  for (const source of [es, en]) {
    assert.doesNotMatch(source, /Vercel/i);
    assert.match(source, /Prisma/);
    assert.match(source, /Docker/);
    assert.match(source, /Daniel García Ortega/);
    assert.match(source, /dangarort123@gmail\.com/);
    assert.match(source, /tel:\+34673971322/);
    assert.match(source, /AL-LÍO/);
    assert.match(source, /SIDN Cost Control/);
    assert.match(source, /Feedback2Action/);
    assert.match(source, /Salunox/);
    assert.match(source, /Konecta/);
    assert.match(source, /Alcampo/);
    assert.match(source, /Instituto Fomento Ocupacional FOC/);
    assert.match(source, /34%/);
  }

  assert.match(es, /Volver al portfolio/);
  assert.match(es, /Descargar CV de Daniel García Ortega en PDF/);
  assert.doesNotMatch(es, />\s*Download PDF\s*</);
  assert.match(en, /Back to portfolio/);
  assert.match(en, />\s*Download PDF\s*</);
  assert.doesNotMatch(en, /Volver al portfolio/);

  assert.match(
    styles,
    /\.cv-sheet\s*\{[\s\S]*?width:\s*210mm;[\s\S]*?height:\s*297mm;/,
  );
  assert.match(styles, /@page\s*\{[\s\S]*?size:\s*A4;[\s\S]*?margin:\s*0;/);
  assert.match(
    styles,
    /@media print[\s\S]*?\.cv-sheet\s*\{[\s\S]*?width:\s*210mm;[\s\S]*?height:\s*297mm;/,
  );
  assert.match(
    styles,
    /@media screen and \(max-width:\s*700px\)[\s\S]*?\.cv-sheet\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*auto;/,
  );
  assert.match(
    styles,
    /@media screen and \(max-width:\s*700px\)[\s\S]*?\.professional-footer\s*\{[\s\S]*?position:\s*static;/,
  );
  assert.match(
    styles,
    /@media print[\s\S]*?\.download-btn,[\s\S]*?\.portfolio-back-link\s*\{[\s\S]*?display:\s*none\s*!important;/,
  );
  assert.match(
    localeControls,
    /@media print[\s\S]*?\.cv-locale-link\s*\{[\s\S]*?display:\s*none\s*!important;/,
  );
}

const current = {
  es: await readRepositoryFile('public/cv/index.html'),
  en: await readRepositoryFile('public/en/cv/index.html'),
  styles: await readRepositoryFile('public/cv/styles.css'),
  localeControls: await readRepositoryFile('public/cv/locale-controls.css'),
  englishDirectoryEntries: await readdir(new URL('public/en/cv/', root)),
};

test('final bilingual CV contract preserves facts, shared assets, navigation and A4 geometry', () => {
  assertFinalCvContract(current);
});

const adversarialCases = [
  {
    name: 'changed A4 height',
    mutate: (contract) => ({
      ...contract,
      styles: mutateRequired(
        contract.styles,
        'height: 297mm;',
        'height: 296mm;',
      ),
    }),
  },
  {
    name: 'reordered major section',
    mutate: (contract) => ({
      ...contract,
      en: mutateRequired(
        mutateRequired(
          mutateRequired(contract.en, 'projects-section', '__audit-projects__'),
          'experience-section',
          'projects-section',
        ),
        '__audit-projects__',
        'experience-section',
      ),
    }),
  },
  {
    name: 'English PDF fallback to Spanish',
    mutate: (contract) => ({
      ...contract,
      en: mutateRequired(
        contract.en,
        'CV-Daniel-Garcia-Ortega-EN.pdf',
        'CV-Daniel-Garcia-Ortega.pdf',
      ),
    }),
  },
  {
    name: 'mobile fixed-width overflow',
    mutate: (contract) => ({
      ...contract,
      styles: mutateRequired(
        contract.styles,
        /(\.cv-sheet\s*\{\s*width:)\s*100%;/,
        '$1 800px;',
      ),
    }),
  },
  {
    name: 'numeric fact drift in English',
    mutate: (contract) => ({
      ...contract,
      en: mutateRequired(contract.en, /22[.,]376/, '22,375'),
    }),
  },
  {
    name: 'Vercel reintroduced in English',
    mutate: (contract) => ({
      ...contract,
      en: mutateRequired(contract.en, 'Prisma', 'Prisma, Vercel'),
    }),
  },
  {
    name: 'Prisma removed from English',
    mutate: (contract) => ({
      ...contract,
      en: mutateRequired(contract.en, /Prisma/g, ''),
    }),
  },
  {
    name: 'duplicated counterpart action',
    mutate: (contract) => ({
      ...contract,
      en: `${contract.en}<a data-locale-link="es" href="../../cv/">ES</a>`,
    }),
  },
  {
    name: 'divergent English stylesheet',
    mutate: (contract) => ({
      ...contract,
      en: mutateRequired(contract.en, '../../cv/styles.css', 'styles.css'),
    }),
  },
  {
    name: 'wrong English back destination',
    mutate: (contract) => ({
      ...contract,
      en: mutateRequired(
        contract.en,
        /class="portfolio-back-link"([\s\S]*?)href="\.\.\/"/,
        'class="portfolio-back-link"$1href="../../"',
      ),
    }),
  },
];

for (const { name, mutate } of adversarialCases) {
  test(`adversarial guard rejects ${name}`, () => {
    assert.throws(() => assertFinalCvContract(mutate(current)));
  });
}

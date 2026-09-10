import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { technologyGroups as enTechnologyGroups } from '../src/data/en/technologies.ts';
import { technologyGroups as esTechnologyGroups } from '../src/data/es/technologies.ts';
import { technologyIcons } from '../src/data/technology-icons.ts';

const expectedSpanish = [
  'HTML5',
  'CSS3',
  'JavaScript',
  'TypeScript',
  'React',
  'Angular',
  'Next.js',
  'Java',
  'Python',
  'FastAPI',
  'Node.js',
  'Laravel/PHP',
  'APIs REST',
  'SQL',
  'PostgreSQL',
  'MySQL/MariaDB',
  'BigQuery',
  'Git',
  'Docker',
];

const expectedEnglish = expectedSpanish.map((technology) =>
  technology === 'APIs REST' ? 'REST APIs' : technology,
);

const flatten = (groups) => groups.flatMap((group) => group.technologies);
const canonicalize = (technology) =>
  technology === 'APIs REST' ? 'REST APIs' : technology;

test('homepage technology inventory is exact, ordered and locale-equivalent', () => {
  const spanish = flatten(esTechnologyGroups);
  const english = flatten(enTechnologyGroups);

  assert.deepEqual(spanish, expectedSpanish);
  assert.deepEqual(english, expectedEnglish);
  assert.deepEqual(spanish.map(canonicalize), english.map(canonicalize));
  assert.equal(new Set(spanish.map(canonicalize)).size, spanish.length);
  assert.equal(new Set(english.map(canonicalize)).size, english.length);
});

test('compact homepage inventory keeps high-signal Git without redundant GitHub', () => {
  const spanish = flatten(esTechnologyGroups);

  assert.ok(spanish.includes('Git'));
  assert.ok(!spanish.includes('GitHub'));

  for (const contextualTechnology of [
    'Astro',
    'Tailwind CSS',
    'Vite',
    'Supabase',
    'Google OAuth',
    'Vertex AI',
    'Flutter/Dart',
    'Firebase',
    'Express',
    'Prisma',
  ]) {
    assert.ok(!spanish.includes(contextualTechnology));
  }
});

test('every displayed technology has an icon and localized REST labels share one asset', async () => {
  for (const technology of [...expectedSpanish, ...expectedEnglish]) {
    const icon = technologyIcons[technology];
    assert.ok(icon, `Missing technology icon mapping for ${technology}`);
    await access(new URL(`../public/${icon}`, import.meta.url));
  }

  assert.equal(
    technologyIcons['APIs REST'],
    technologyIcons['REST APIs'],
    'REST API aliases must share one icon',
  );
  assert.equal(technologyIcons.Angular, 'images/technologies/angular.svg');
  assert.equal(
    technologyIcons['Laravel/PHP'],
    'images/technologies/laravel.svg',
  );
});

test('README recruiter-facing Stack matches the approved homepage inventory', async () => {
  const readme = await readFile(
    new URL('../README.md', import.meta.url),
    'utf8',
  );

  assert.match(
    readme,
    /\*\*Frontend:\*\* HTML5, CSS3, JavaScript, TypeScript, React, Angular, Next\.js/,
  );
  assert.match(
    readme,
    /\*\*Backend:\*\* Java, Python, FastAPI, Node\.js, Laravel\/PHP, REST APIs/,
  );
  assert.match(
    readme,
    /\*\*Data:\*\* SQL, PostgreSQL, MySQL\/MariaDB, BigQuery/,
  );
  assert.match(readme, /\*\*Tools:\*\* Git, Docker/);
});

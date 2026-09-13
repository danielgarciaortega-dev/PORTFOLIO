import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalProjects } from '../src/data/career/projects.ts';
import { projects as esProjects } from '../src/data/es/projects.ts';

const ids = canonicalProjects.map((project) => project.id);

test('canonical project ids are unique', () => {
  assert.equal(new Set(ids).size, ids.length);
});

test('every public featured presentation project exists in canonical inventory', () => {
  for (const project of esProjects) {
    const canonical = canonicalProjects.find(
      (candidate) => candidate.id === project.id,
    );

    assert.ok(canonical, `Missing canonical project: ${project.id}`);
    assert.equal(canonical.featuredPublicly, true);
  }
});

test('canonical application evidence has provenance and evidence tags', () => {
  for (const project of canonicalProjects.filter(
    (candidate) => candidate.applicationEvidence,
  )) {
    assert.ok(project.sources.length > 0, `${project.id} has no source`);
    assert.ok(
      project.evidenceTags.length > 0,
      `${project.id} has no evidence tags`,
    );
  }
});

test('canonical public repository sources do not contain private GitHub URLs', () => {
  for (const project of canonicalProjects) {
    for (const source of project.sources) {
      if (source.kind !== 'repository' || source.url === null) continue;

      assert.match(source.url, /^https:\/\/github\.com\/danielgarciaortega-dev\//);
    }
  }
});

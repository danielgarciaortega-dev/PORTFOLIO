import assert from 'node:assert/strict';
import test from 'node:test';

import { projects as enProjects } from '../src/data/en/projects.ts';
import { projects as esProjects } from '../src/data/es/projects.ts';

function sharedProjectFacts(project) {
  return {
    id: project.id,
    title: project.title,
    context: project.context,
    status: project.status,
    featured: project.featured,
    technologies: project.technologies,
    image: project.image,
    repositoryUrl: project.repositoryUrl,
    liveUrl: project.liveUrl,
    eventUrl: project.eventUrl,
  };
}

test('project locale namespaces preserve facts while keeping copy localized', () => {
  assert.equal(esProjects.length, 3);
  assert.equal(enProjects.length, 3);
  assert.deepEqual(
    esProjects.map(sharedProjectFacts),
    enProjects.map(sharedProjectFacts),
  );

  assert.equal(
    esProjects[0].shortDescription,
    'AL-LÍO centraliza tareas, calendario, formación y oportunidades profesionales para reducir la fragmentación entre distintas herramientas.',
  );
  assert.equal(
    enProjects[0].shortDescription,
    'AL-LÍO brings tasks, calendar, learning and professional opportunities into one place to reduce switching between separate tools.',
  );
  assert.doesNotMatch(esProjects[0].shortDescription, /brings tasks/);
  assert.doesNotMatch(enProjects[0].shortDescription, /centraliza tareas/);

  assert.deepEqual(esProjects[2].metrics, [
    '22.376 reseñas analizadas',
    '409 grupos de problemas',
    '108 acciones priorizadas',
  ]);
  assert.deepEqual(enProjects[2].metrics, [
    '22,376 reviews analyzed',
    '409 problem groups',
    '108 prioritized actions',
  ]);
});

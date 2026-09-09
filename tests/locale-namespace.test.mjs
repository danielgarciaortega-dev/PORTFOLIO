import assert from 'node:assert/strict';
import test from 'node:test';

import { education as enEducation } from '../src/data/en/education.ts';
import { experience as enExperience } from '../src/data/en/experience.ts';
import { profile as enProfile } from '../src/data/en/profile.ts';
import { technologyGroups as enTechnologyGroups } from '../src/data/en/technologies.ts';
import { education as esEducation } from '../src/data/es/education.ts';
import { experience as esExperience } from '../src/data/es/experience.ts';
import { profile as esProfile } from '../src/data/es/profile.ts';
import { technologyGroups as esTechnologyGroups } from '../src/data/es/technologies.ts';

function normalizeTechnologyName(value) {
  return value === 'APIs REST' ? 'REST APIs' : value;
}

function sharedProfileFields(profile) {
  return {
    fullName: profile.fullName,
    shortBrand: profile.shortBrand,
    availability: profile.availability,
    profileImage: profile.profileImage,
    profileImageMobile: profile.profileImageMobile,
    aboutImage: profile.aboutImage,
  };
}

function sharedEducationFields(entry) {
  return {
    institution: entry.institution,
    logo: entry.logo,
  };
}

function sharedExperienceFields(entry) {
  return {
    company: entry.company,
    period: entry.period,
    logo: entry.logo,
    technologies: entry.technologies,
  };
}

test('profile namespaces preserve shared facts and locale-specific copy', () => {
  assert.deepEqual(
    sharedProfileFields(esProfile),
    sharedProfileFields(enProfile),
  );

  assert.equal(esProfile.role, 'Desarrollador web full-stack');
  assert.equal(enProfile.role, 'Full-stack web developer');
  assert.match(esProfile.heroDescription, /Estudiante de 2º curso/);
  assert.match(enProfile.heroDescription, /second year/);
  assert.doesNotMatch(esProfile.heroDescription, /second year/);
  assert.doesNotMatch(enProfile.heroDescription, /Estudiante/);

  assert.equal(esProfile.milestones.length, enProfile.milestones.length);
  assert.deepEqual(
    esProfile.milestones.map(({ label }) => label),
    ['Formación', 'Prácticas', 'Hackathon', 'Proyecto propio'],
  );
  assert.deepEqual(
    enProfile.milestones.map(({ label }) => label),
    ['Education', 'Internship', 'Hackathon', 'Personal project'],
  );
});

test('education and experience namespaces keep facts aligned without copy leakage', () => {
  assert.equal(esEducation.length, enEducation.length);
  assert.deepEqual(
    esEducation.map(sharedEducationFields),
    enEducation.map(sharedEducationFields),
  );
  assert.equal(
    esEducation[0].title,
    'FP Grado Superior en Desarrollo de Aplicaciones Web',
  );
  assert.equal(
    enEducation[0].title,
    'Higher Technician in Web Application Development',
  );
  assert.equal(esEducation[0].period, '2025 — Actualidad');
  assert.equal(enEducation[0].period, '2025 — Present');
  assert.doesNotMatch(esEducation[0].title, /Higher Technician/);
  assert.doesNotMatch(enEducation[0].title, /Grado Superior/);

  assert.equal(esExperience.length, enExperience.length);
  assert.deepEqual(
    esExperience.map(sharedExperienceFields),
    enExperience.map(sharedExperienceFields),
  );
  assert.equal(esExperience[0].role, 'Desarrollador web en prácticas');
  assert.equal(enExperience[0].role, 'Web Development Intern');
  assert.equal(esExperience[1].mode, 'Teletrabajo');
  assert.equal(enExperience[1].mode, 'Remote');
  assert.doesNotMatch(esExperience[0].role, /Web Development Intern/);
  assert.doesNotMatch(enExperience[0].role, /Desarrollador/);
});

test('technology namespaces preserve stacks while localizing labels deterministically', () => {
  assert.equal(esTechnologyGroups.length, enTechnologyGroups.length);
  assert.deepEqual(
    esTechnologyGroups.map(({ technologies }) =>
      technologies.map(normalizeTechnologyName),
    ),
    enTechnologyGroups.map(({ technologies }) =>
      technologies.map(normalizeTechnologyName),
    ),
  );

  assert.deepEqual(
    esTechnologyGroups.map(({ label }) => label),
    ['Frontend', 'Backend', 'Datos', 'Herramientas'],
  );
  assert.deepEqual(
    enTechnologyGroups.map(({ label }) => label),
    ['Frontend', 'Backend', 'Data', 'Tools'],
  );
  assert.ok(esTechnologyGroups[1].technologies.includes('APIs REST'));
  assert.ok(enTechnologyGroups[1].technologies.includes('REST APIs'));
  assert.ok(!esTechnologyGroups[1].technologies.includes('REST APIs'));
  assert.ok(!enTechnologyGroups[1].technologies.includes('APIs REST'));
});

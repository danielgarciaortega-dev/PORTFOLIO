import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const template = readFileSync('.github/pull_request_template.md', 'utf8');
const qaDocs = readFileSync('docs/README.md', 'utf8');
const visualSpec = readFileSync('tests/visual.spec.ts', 'utf8');

test('requires exact-head automated gates and visual review metadata', () => {
  for (const requiredText of [
    '`Repository validation`',
    '`Preview readiness`',
    'Current reviewed PR head SHA',
    'Validated Vercel Preview URL',
    'Production comparison target',
    'Intentionally changed surfaces',
    'Expected visual differences',
  ]) {
    assert.match(
      template,
      new RegExp(requiredText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    );
  }

  assert.match(
    template,
    /https:\/\/danielgarciaortega-dev\.github\.io\/PORTFOLIO\//,
  );
});

test('keeps desktop and mobile viewport review explicit', () => {
  for (const viewport of ['390×844', '768×1024', '1440×900', '1920×1080']) {
    assert.match(template, new RegExp(viewport));
    assert.match(qaDocs, new RegExp(viewport));
  }

  assert.match(template, /Mobile behavior reviewed/);
  assert.match(template, /Desktop behavior reviewed/);
});

test('invalidates manual visual review after a new push', () => {
  assert.match(template, /any new push invalidates this visual review/i);
  assert.match(qaDocs, /Cualquier push posterior invalida esa revisión manual/);
});

test('does not burden non-visual changes with screenshot churn', () => {
  assert.match(
    template,
    /do not regenerate screenshots solely to fill this section/i,
  );
  assert.match(template, /No rendered UI change is intended/);
  assert.match(qaDocs, /cambios no visuales no se deben regenerar capturas/i);
  assert.match(qaDocs, /Preview visual evidence` se omite/);
});

test('documents current screenshots truthfully as review artifacts', () => {
  assert.match(visualSpec, /page\.screenshot\(/);
  assert.doesNotMatch(visualSpec, /toHaveScreenshot\(/);
  assert.match(qaDocs, /artefactos de revisión/);
  assert.match(qaDocs, /no assertions de regresión visual por píxel/);
});

test('documents protected Preview artifacts as evidence rather than approval', () => {
  assert.match(qaDocs, /preview-visual-evidence-<PR>-<SHA>/);
  assert.match(qaDocs, /Preview protegido/i);
  assert.match(qaDocs, /no es un tercer gate requerido/i);
  assert.match(qaDocs, /no hace pixel-diff/i);
  assert.match(qaDocs, /no aprueba visualmente la PR/i);
});

test('keeps automated gates distinct from manual visual review', () => {
  assert.match(
    template,
    /automated gates do not replace manual visual review/i,
  );
  assert.match(qaDocs, /permanecen separados de la aprobación visual manual/);
});

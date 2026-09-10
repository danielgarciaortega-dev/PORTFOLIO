import assert from 'node:assert/strict';
import test from 'node:test';

import {
  assertMainRuleset,
  validateMainRuleset,
} from '../scripts/lib/main-ruleset-governance.mjs';

function createSafeRuleset() {
  return {
    name: 'Protect main',
    enforcement: 'active',
    conditions: {
      ref_name: {
        include: ['refs/heads/main'],
        exclude: [],
      },
    },
    bypass_actors: [],
    rules: [
      { type: 'deletion' },
      { type: 'non_fast_forward' },
      {
        type: 'pull_request',
        parameters: {
          required_review_thread_resolution: true,
        },
      },
      {
        type: 'required_status_checks',
        parameters: {
          strict_required_status_checks_policy: true,
          required_status_checks: [
            { context: 'Repository validation', integration_id: 15368 },
            { context: 'Preview readiness', integration_id: 15368 },
          ],
        },
      },
    ],
  };
}

test('accepts the intended Protect main contract without bypass actors', () => {
  const result = validateMainRuleset(createSafeRuleset());
  assert.deepEqual(result, { ok: true, failures: [] });
  assert.doesNotThrow(() => assertMainRuleset(createSafeRuleset()));
});

test('rejects the repository-role pull-request bypass that caused issue 142', () => {
  const hostile = createSafeRuleset();
  hostile.bypass_actors = [
    {
      actor_id: 5,
      actor_type: 'RepositoryRole',
      bypass_mode: 'pull_request',
    },
  ];

  const result = validateMainRuleset(hostile);
  assert.equal(result.ok, false);
  assert.ok(
    result.failures.includes(
      'Protect main must not expose ordinary pull-request bypass actors',
    ),
  );
  assert.throws(
    () => assertMainRuleset(hostile),
    /must not expose ordinary pull-request bypass actors/,
  );
});

test('fails closed when the API does not expose bypass actors', () => {
  const hidden = createSafeRuleset();
  delete hidden.bypass_actors;

  const result = validateMainRuleset(hidden);
  assert.equal(result.ok, false);
  assert.ok(
    result.failures.includes(
      'Protect main bypass actors must be observable before governance can pass',
    ),
  );
  assert.throws(
    () => assertMainRuleset(hidden),
    /bypass actors must be observable/,
  );
});

test('rejects weakening strict checks or dropping either protected context', () => {
  const hostile = createSafeRuleset();
  const statusRule = hostile.rules.find(
    (rule) => rule.type === 'required_status_checks',
  );
  statusRule.parameters.strict_required_status_checks_policy = false;
  statusRule.parameters.required_status_checks = [
    { context: 'Repository validation', integration_id: 15368 },
  ];

  const result = validateMainRuleset(hostile);
  assert.equal(result.ok, false);
  assert.ok(
    result.failures.includes(
      'required status checks must use strict/up-to-date enforcement',
    ),
  );
  assert.ok(
    result.failures.includes('missing required status check: Preview readiness'),
  );
});

test('rejects loss of pull-request review-thread resolution or main targeting', () => {
  const hostile = createSafeRuleset();
  hostile.conditions.ref_name.include = ['refs/heads/develop'];
  const pullRequestRule = hostile.rules.find(
    (rule) => rule.type === 'pull_request',
  );
  pullRequestRule.parameters.required_review_thread_resolution = false;

  const result = validateMainRuleset(hostile);
  assert.equal(result.ok, false);
  assert.ok(result.failures.includes('Protect main must target refs/heads/main'));
  assert.ok(
    result.failures.includes(
      'pull-request review thread resolution must remain required',
    ),
  );
});

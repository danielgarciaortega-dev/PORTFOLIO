export const REQUIRED_STATUS_CHECKS = [
  'Repository validation',
  'Preview readiness',
];

export function validateMainRuleset(ruleset) {
  const failures = [];

  if (!ruleset || typeof ruleset !== 'object') {
    return { ok: false, failures: ['ruleset payload is missing'] };
  }

  if (ruleset.name !== 'Protect main') {
    failures.push('expected the active ruleset to be named Protect main');
  }

  if (ruleset.enforcement !== 'active') {
    failures.push('Protect main must use active enforcement');
  }

  const includedRefs = ruleset.conditions?.ref_name?.include ?? [];
  if (!includedRefs.includes('refs/heads/main')) {
    failures.push('Protect main must target refs/heads/main');
  }

  if ((ruleset.bypass_actors ?? []).length > 0) {
    failures.push('Protect main must not expose ordinary pull-request bypass actors');
  }

  const rules = Array.isArray(ruleset.rules) ? ruleset.rules : [];
  const byType = new Map(rules.map((rule) => [rule.type, rule]));

  for (const ruleType of ['deletion', 'non_fast_forward', 'pull_request']) {
    if (!byType.has(ruleType)) {
      failures.push(`missing required ${ruleType} rule`);
    }
  }

  const pullRequestRule = byType.get('pull_request');
  if (pullRequestRule?.parameters?.required_review_thread_resolution !== true) {
    failures.push('pull-request review thread resolution must remain required');
  }

  const statusRule = byType.get('required_status_checks');
  if (!statusRule) {
    failures.push('missing required_status_checks rule');
  } else {
    if (statusRule.parameters?.strict_required_status_checks_policy !== true) {
      failures.push('required status checks must use strict/up-to-date enforcement');
    }

    const contexts = new Set(
      (statusRule.parameters?.required_status_checks ?? []).map(
        (check) => check.context,
      ),
    );

    for (const context of REQUIRED_STATUS_CHECKS) {
      if (!contexts.has(context)) {
        failures.push(`missing required status check: ${context}`);
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function assertMainRuleset(ruleset) {
  const result = validateMainRuleset(ruleset);
  if (!result.ok) {
    throw new Error(`Unsafe Protect main ruleset:\n- ${result.failures.join('\n- ')}`);
  }
}

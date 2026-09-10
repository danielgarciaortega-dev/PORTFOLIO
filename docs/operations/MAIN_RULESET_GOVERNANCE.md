# Protected main governance

This document is the maintained contract for repository rules that protect `main`.

## Required ruleset

Repository ruleset `Protect main` must:

- target exactly `refs/heads/main`;
- use active enforcement;
- require pull requests;
- require review-thread resolution;
- block branch deletion;
- block non-fast-forward updates;
- require strict/up-to-date `Repository validation`;
- require strict/up-to-date `Preview readiness` while that check remains part of the repository policy;
- expose **no ordinary pull-request bypass actors**.

The expected steady state is therefore an empty `bypass_actors` array for normal repository roles.

## Why bypass actors are forbidden

A repository-role actor with `bypass_mode: pull_request` can allow a merge while a required check is red. That defeats the purpose of declaring those checks required and makes the written merge policy weaker than the effective server-side policy.

Provider outages or quota limits are not reasons to keep an ordinary bypass permanently enabled. If the repository later adopts a different Preview policy, that policy must be changed explicitly in its owning issue/ruleset rather than bypassing a red required check.

## Automated guard

`Repository validation` runs:

```text
node scripts/check-main-ruleset-governance.mjs
```

The script reads the live GitHub ruleset and fails closed if the protected-main contract is weakened. Pure regression coverage lives in `tests/main-ruleset-governance.test.mjs` and includes an adversarial fixture matching the repository-role PR bypass that triggered #142.

The live check must never print tokens or mutate repository settings. It only reads the active ruleset and validates it.

## Administrative change required for #142

In GitHub repository settings, edit the active `Protect main` ruleset and remove the repository-role bypass actor that is allowed to bypass through pull requests. Preserve the required rules and checks listed above.

After saving, verify through the GitHub API that:

- `bypass_actors` is empty;
- `current_user_can_bypass` no longer reports normal PR bypass capability;
- `Repository validation` and `Preview readiness` remain strict required checks;
- review-thread resolution remains required.

## Adversarial merge proof

The final proof for #142 must use a disposable PR whose `Repository validation` is deliberately red. Attempting a normal merge must be rejected by GitHub. The proof PR must then be closed without merge and its branch retired.

Do **not** perform that merge attempt while the current bypass actor still exists, because GitHub may legitimately accept it under the unsafe configuration and pollute `main`.

## Emergency recovery

There is no standing ordinary merge bypass. If an exceptional repository-owner recovery mechanism is ever introduced later, it must be separately documented, narrowly scoped, auditable, and incapable of becoming the normal automation path. It must not silently redefine a red required check as green.

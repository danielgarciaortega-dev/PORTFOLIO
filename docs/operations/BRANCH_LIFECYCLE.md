# Branch lifecycle and stale-ref policy

This document defines the safe lifecycle for non-default branches in this repository. It complements `.github/workflows/branch-cleanup.yml`; it does not broaden that workflow.

## Automatic cleanup boundary

`branch-cleanup.yml` is intentionally merge-driven. It deletes a same-repository head branch only after its pull request is closed **and merged**, and it never targets the default branch.

The workflow does **not** delete:

- abandoned branches with no pull request;
- pull-request branches closed without merge;
- temporary proof/audit branches that were intentionally never merged;
- stale stacked implementation branches that have been superseded by a newer architecture.

Those cases require explicit audit and explicit branch-specific retirement.

## Safe retirement gate

Before retiring a stale remote ref:

1. confirm the branch is not the default branch and has no open pull request;
2. compare it with current `main` and identify any commits or files that are not already represented in the current architecture;
3. preserve still-valid intent in the owning issue or maintained repository documentation before deletion;
4. prefer rebuilding future work from current `main` instead of rebasing, merging or cherry-picking an obsolete implementation stack;
5. delete only the exact audited ref;
6. re-check the repository after deletion so no open work references the retired branch.

Do not add glob-based, age-only or ownership-blind deletion to `branch-cleanup.yml`. An abandoned branch can contain valid unmerged work, so its existence alone is not permission to delete it.

## Bilingual route restart rule

The superseded pre-final-shell branches for bilingual project routes and metadata are not implementation sources.

- #53 must start from a fresh branch based on the final post-#83/post-hygiene/post-governance `main`.
- #54 must start only after the new #53 is merged and must branch from that resulting `main`.
- Old #53/#54 refs must never be merged, rebased forward or used as the base for the new work.

Their valid product intent belongs in the maintained issue contracts and the repository source of truth, not in stale branch topology.

## Proof and no-op branches

Disposable ruleset proofs, audit placeholders and CI-trigger branches should normally be deleted once their evidence has been recorded and no open pull request depends on them. If tooling cannot perform the deletion immediately, they remain explicitly retired: they must not be used as implementation bases and the pending physical deletion should be tracked separately.

## Default working model

For new implementation work:

- branch from the current protected `main`;
- keep one issue/scope per branch where practical;
- open a pull request and require the repository gates for that exact head;
- merge only after the issue-specific validation is satisfied;
- let `branch-cleanup.yml` remove the merged branch automatically;
- handle abandoned or deliberately unmerged branches through the explicit audit path above.

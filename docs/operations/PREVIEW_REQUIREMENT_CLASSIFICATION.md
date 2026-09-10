# Preview Requirement Classification

This document defines the narrow exception used by the stable `Preview readiness` check for pull requests that cannot affect the deployed portfolio.

## Safety objective

`Repository validation` and the stable `Preview readiness` check remain required for every pull request. The classification only decides whether `Preview readiness` must wait for and smoke a native exact-head Vercel Preview.

A native Vercel Preview is still mandatory for any application, public asset, build, hosting, package, workflow, policy or unknown change. Visual pull requests always require a real exact-head Preview regardless of their changed paths.

## Verified repository-only allowlist

A non-visual pull request may be classified as repository-only only when every changed repository path is one of:

- `tests/**`;
- `docs/**`;
- root `README.md`;
- root `AGENTS.md`;
- `scripts/capture-preview-visual-evidence.mjs`.

These documentation paths are repository-maintenance inputs only under the current Astro build: they are outside `src/` and `public/`, are not imported by application/build configuration, and are not copied into the deployed portfolio output. The exemption is deliberately path-specific rather than a general Markdown or text-file rule.

The policy-owning implementation remains excluded from its own exemption. Changes to `scripts/preview-readiness.mjs`, `scripts/lib/preview-requirement.mjs`, `.github/workflows/**`, package/lock files, `astro.config.*`, `vercel.json`, `src/**`, `public/**`, build/export/hosting scripts or any unknown path require a fresh exact-head Vercel Preview.

Repository path validation also fails closed. Absolute paths, Windows separators, empty segments, `.` / `..` traversal segments and malformed filenames are never accepted as repository-only even when their text appears to begin with an allowlisted prefix.

## Exact-head and changed-file verification

Before repository-only classification succeeds, automation:

1. reads the live pull request from GitHub and requires its head SHA to equal `EXPECTED_HEAD_SHA`;
2. reads all changed-file pages with `per_page=100` and requires the number of returned file entries to match GitHub's `changed_files` count;
3. inspects both `filename` and `previous_filename` for renames so moving deployable code into an allowlisted path, or moving an allowlisted file into deployable code, cannot hide a deployment-affecting change;
4. rejects malformed, unsafe, missing or incomplete path metadata;
5. forces a real Preview when the PR is marked Visual;
6. re-reads and reclassifies the exact pull request before reporting repository-only success;
7. fails closed if the head, visual classification, file count or changed paths differ between the two reads.

## Required-check behavior

For an eligible repository-only PR:

- `Repository validation` must already be successful;
- `Preview readiness` succeeds on the exact current head with mode `strict repository-only diff`;
- no Vercel Preview URL is invented or reused;
- no stale deployment evidence is accepted;
- no `Preview visual evidence` artifact is expected because Visual PRs cannot use this mode.

For every other PR, the existing exact-head provider evidence, protected Preview smoke and final evidence revalidation remain unchanged.

## Explicit fail-closed examples

The following still require a real Preview even when accompanied only by allowlisted docs/tests:

- `src/**` application changes;
- `public/**` assets or standalone public files;
- `.github/workflows/**` automation changes;
- `astro.config.*`, `vercel.json`, package and lock files;
- Preview/readiness/hosting/build/export scripts;
- any unknown path;
- any rename for which either `filename` or `previous_filename` is deployable/unknown;
- any pull request explicitly marked Visual.

This boundary is protected by adversarial tests. Broadening the rule to `src/**`, `public/**`, arbitrary unknown files or unsafe path forms must make the regression suite fail.

## Why this exists

The Vercel Hobby deployment quota can be exhausted by CI and repository-maintenance iteration. Requiring a deployment for tests or verified repository-only documentation consumes quota without adding evidence about the rendered application. The narrow classification reduces that waste while preserving fail-closed behavior for anything that can affect the deployed site.

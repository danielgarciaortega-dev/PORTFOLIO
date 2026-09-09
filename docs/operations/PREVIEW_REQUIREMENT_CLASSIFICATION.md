# Preview Requirement Classification

This document defines the narrow exception used by the stable `Preview readiness` check for pull requests that cannot affect the deployed portfolio.

## Safety objective

`Repository validation` and the stable `Preview readiness` check remain required for every pull request. The classification only decides whether `Preview readiness` must wait for and smoke a native exact-head Vercel Preview.

A native Vercel Preview is still mandatory for any application, public asset, build, hosting, package, workflow, policy or unknown change. Visual pull requests always require a real exact-head Preview regardless of their changed paths.

## Initial repository-only allowlist

A non-visual pull request may be classified as repository-only only when every changed repository path is one of:

- `tests/**`;
- `scripts/capture-preview-visual-evidence.mjs`.

No broader `scripts/**`, `docs/**` or `.github/**` exemption exists.

The policy-owning implementation is deliberately excluded. Changes to `scripts/preview-readiness.mjs`, `scripts/lib/preview-requirement.mjs`, `.github/workflows/validate.yml`, package files, `vercel.json`, `src/**`, `public/**`, build/export scripts or any unknown path require a fresh exact-head Vercel Preview.

## Exact-head and changed-file verification

Before repository-only classification succeeds, automation:

1. reads the live pull request from GitHub and requires its head SHA to equal `EXPECTED_HEAD_SHA`;
2. reads all changed-file pages with `per_page=100` and requires the number of returned file entries to match GitHub's `changed_files` count;
3. inspects both `filename` and `previous_filename` for renames so moving deployable code into an allowlisted path cannot hide a deployment-affecting change;
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

## Why this exists

The Vercel Hobby deployment quota can be exhausted by CI-only iteration. Requiring a deployment for a test-only or capture-helper-only change consumes quota without adding evidence about the rendered application. The narrow classification reduces that waste while preserving fail-closed behavior for anything that can affect the deployed site.

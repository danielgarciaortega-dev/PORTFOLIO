# PR Preview and GitHub Pages Operations

This document is the maintained operational reference for pull-request previews, review readiness, repository protection, and production publication.

## 1. Architecture

The repository intentionally uses two different hosting roles:

- **GitHub Pages is canonical production.** Production is built and published only from `main` through `.github/workflows/deploy.yml`.
- **Vercel is preview/review infrastructure only.** Native Vercel Git Integration creates deployments for pull-request/feature heads. Vercel must not be used to promote or replace production.
- `vercel.json` disables Vercel Git deployments for `main`.

This separation lets a PR be tested as a real deployed site without giving the PR workflow GitHub Pages publication permissions or a Vercel production/deployment token.

## 2. Hosting and base-path contract

`scripts/lib/hosting-config.mjs` is the source of truth for host-aware Astro configuration.

| Environment               | Site/origin                                          | Base path    |
| ------------------------- | ---------------------------------------------------- | ------------ |
| Local development         | `http://localhost:4321` unless explicitly overridden | `/`          |
| GitHub Pages project site | inferred from `GITHUB_REPOSITORY`                    | `/PORTFOLIO` |
| Vercel Preview            | inferred from `VERCEL_URL`                           | `/`          |

Explicit `SITE_URL` and `BASE_PATH` values take precedence when intentionally supplied. Normal Vercel Preview operation relies on Vercel-provided `VERCEL=1` and `VERCEL_URL`; normal Pages operation relies on GitHub metadata. Do not manually force `/PORTFOLIO` into a Vercel Preview.

A Vercel Preview that exposes `/PORTFOLIO/` as its live base or leaks that Pages base into Preview-local markup is treated as invalid by `Preview readiness`.

## 3. Pull-request validation lifecycle

`.github/workflows/validate.yml` runs for pull requests targeting `main`.

### `Repository validation`

This job is the code/test gate. It runs with read-only repository permissions and performs the repository validation chain, including dependency audit, generated-asset validation, CV export, formatting, Astro checks, focused Node tests, build, and Playwright E2E validation.

PR concurrency is isolated by PR/ref:

`pr-validation-${{ github.event.pull_request.number || github.ref }}`

`cancel-in-progress: true` means a newer push cancels obsolete work for that same PR without sharing the production Pages lock or cancelling unrelated PRs.

### `Preview readiness`

This job runs only after `Repository validation` and uses the exact current pull-request head.

The sequence is:

1. require `Repository validation` success;
2. checkout the exact `github.event.pull_request.head.sha`;
3. re-read the live PR head and reject a stale workflow head;
4. boundedly wait for Vercel evidence associated with that same SHA;
5. require agreement between the Vercel commit status and official `vercel[bot]` deployment/inspector evidence;
6. resolve the validated Preview URL;
7. smoke the deployed Preview;
8. revalidate exact-head provider evidence after smoke to close the race window;
9. complete the stable `Preview readiness` check only if all steps still refer to the same current head.

A stable `*.vercel.app` branch alias is discovery-only. It is not a deployment identity and must never be treated as sufficient proof for the current commit.

### `Preview visual evidence`

Visual PRs run a separate, non-required evidence job after `Preview readiness` succeeds. The readiness job exposes only its already validated Preview URL as a job output; the evidence job checks out the same exact PR head, captures the protected Preview and uploads review artifacts.

This job is deliberately separate from the two protected required checks. A capture failure must not redefine what `Preview readiness` means, and a successful capture must not be interpreted as automatic visual approval.

## 4. Exact-head evidence implementation

The relevant implementation is intentionally split by responsibility:

- `scripts/lib/vercel-preview-evidence.mjs` — parses and validates provider/GitHub evidence for the exact head;
- `scripts/lib/preview-readiness.mjs` — bounded waiting, live-head checks, smoke orchestration, diagnostics and final revalidation;
- `scripts/preview-readiness.mjs` — GitHub Actions entry point and validated Preview URL output;
- `scripts/lib/vercel-preview-fetch.mjs` — protected-Preview HTTP wrapper and bypass-header isolation for smoke;
- `scripts/lib/preview-visual-evidence.mjs` — exact-origin validation, viewport contract, secret-isolated browser headers and manifest creation;
- `scripts/capture-preview-visual-evidence.mjs` — Playwright capture entry point for exact-head protected Preview evidence;
- `.github/workflows/validate.yml` — job sequencing and least-privilege workflow wiring.

Regression coverage lives in:

- `tests/vercel-preview-evidence.test.mjs`;
- `tests/preview-readiness.test.mjs`;
- `tests/preview-readiness-workflow.test.mjs`;
- `tests/preview-visual-evidence.test.mjs`;
- `tests/vercel-preview-fetch.test.mjs`;
- `tests/astro-hosting-config.test.mjs`;
- `tests/vercel-git-policy.test.mjs`.

A previous-head success never satisfies a new push. Each new PR head must obtain fresh `Repository validation`, Vercel evidence, and `Preview readiness`. Visual evidence is likewise tied to that immutable head SHA.

## 5. Preview smoke scope

The current Preview gate validates routes that exist on the current application contract:

- `/`;
- `/en/`;
- `/proyectos/`;
- `/cv/`;
- `/cv/500x500.jpg`;
- one intentionally missing route that must behave as a real 404.

It also rejects provider fallback behavior that masks a missing route and rejects GitHub Pages `/PORTFOLIO/` base leakage.

When future work adds routes such as `/en/projects/` or `/en/cv/`, update the smoke contract only in the issue that owns those routes, with tests in the same change.

## 6. Waiting, timeout and failure behavior

`Preview readiness` uses bounded polling rather than an infinite wait. The workflow currently supplies:

- `PREVIEW_WAIT_TIMEOUT_MS=600000`;
- `PREVIEW_POLL_INTERVAL_MS=5000`.

Retryable states such as missing/pending provider evidence may be polled until the bound is reached. Terminal provider failures, stale-head mismatches, invalid evidence, broken smoke responses, base-path leakage, or missing protected-preview access fail closed immediately with actionable diagnostics.

A timeout means the PR is **not review-ready**. Do not bypass the check simply because a Preview URL exists.

## 7. Protected Vercel Previews

Deployment Protection remains enabled. Automation uses Vercel's official Protection Bypass for Automation.

Required GitHub Actions repository secret:

- `VERCEL_AUTOMATION_BYPASS_SECRET` — allows automated validation and evidence capture against protected Vercel Preview hosts.

Security properties:

- the value is never committed or documented;
- the workflow passes it only to the exact-head Preview smoke and visual-evidence capture steps that require protected Preview access;
- `scripts/lib/vercel-preview-fetch.mjs` sends it only as `x-vercel-protection-bypass` to HTTPS `*.vercel.app` Preview hosts during HTTP smoke;
- `scripts/lib/preview-visual-evidence.mjs` narrows browser injection further to the exact validated Preview origin, so cross-origin assets, `vercel.com`, the `vercel.app` apex, lookalike domains and HTTP never receive the secret;
- screenshots and `manifest.json` never contain the secret as workflow metadata;
- no `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, or `VERCEL_ORG_ID` is required for these gates or artifacts.

`GITHUB_TOKEN` is the normal GitHub Actions token supplied by GitHub and is used with the read permissions declared in the workflow.

The Vercel Protection Bypass secret is only an HTTP access mechanism for protected Preview deployments. It is unrelated to GitHub branch/ruleset bypass and must never be interpreted as permission to merge a PR with a red required check.

## 8. GitHub Pages production lifecycle

`.github/workflows/deploy.yml` runs on pushes to `main` and manual dispatch.

It has a production-only concurrency group:

`pages-production`

with `cancel-in-progress: false`.

The sequence is:

1. `Production validation`;
2. `Build Pages artifact`;
3. `Deploy GitHub Pages`.

Repository-level workflow permissions remain `contents: read`. Only the final deploy job receives:

- `pages: write`;
- `id-token: write`.

Publication is additionally gated by repository variable:

- `PUBLICATION_APPROVED` — production deploy runs only when its value is exactly `true`.

A PR workflow cannot publish GitHub Pages. A successful Vercel Preview does not publish production.

## 9. `main` governance

Active repository ruleset: **`Protect main`**.

The required steady-state policy is:

- target exactly `main`;
- pull request required;
- required approvals: `0` for this personal repository;
- review conversations must be resolved;
- required checks:
  - `Repository validation`;
  - `Preview readiness`;
- strict/up-to-date status-check policy enabled;
- branch deletion blocked;
- force/non-fast-forward pushes blocked;
- no ordinary repository-role pull-request bypass actor.

Do not add the raw `Vercel` status or `Preview visual evidence` as another required check. `Preview readiness` already validates Vercel deployment identity and deployed smoke for the current head. Visual evidence supports the separate manual review contract.

A required check that is red remains blocking. Provider outage or quota exhaustion does not implicitly authorize a GitHub ruleset bypass. If the repository later changes which checks are required, make that change explicitly in the owning governance issue and ruleset.

The detailed no-bypass contract and adversarial merge-proof procedure are maintained in `docs/operations/MAIN_RULESET_GOVERNANCE.md`.

## 10. Visual review

`.github/pull_request_template.md` defines the review contract introduced for visual work.

For a **Visual** PR, record and review:

- exact current head SHA;
- validated Vercel Preview URL for that SHA;
- GitHub Pages production comparison target;
- intentionally changed surfaces;
- 390×844, 768×1024, 1440×900 and 1920×1080;
- mobile and desktop behavior;
- intentional visual-evidence updates;
- expected differences.

After `Preview readiness` succeeds, `Preview visual evidence` captures the actual protected Vercel Preview for `/` and `/en/` at all four required viewports. At 390×844 and 768×1024 it also records the opened mobile-menu state. The job uploads `preview-visual-evidence-<PR>-<SHA>` with screenshots plus a `manifest.json` that records the exact head and validated Preview URL.

The artifact is review evidence only. It does not use pixel-diff assertions, it does not approve a PR, and it is not a branch-protection gate. Its purpose is to make the exact protected Preview inspectable even when the reviewer's browser has no interactive Vercel-team session.

Any new push invalidates the prior manual visual review until the new exact-head Preview is ready and reviewed again. The new head also receives a distinct evidence artifact when the PR remains marked Visual.

`Repository validation` and `Preview readiness` are automated gates. They do not replace manual inspection when rendered UI changes.

For **Non-visual** PRs, the evidence job is skipped and screenshots must not be regenerated solely to create review churn.

`docs/README.md` documents both screenshot modes. `tests/visual.spec.ts` creates repository review artifacts with `page.screenshot(...)`; it does not currently use `toHaveScreenshot(...)` pixel-diff assertions. The CI Preview evidence is also screenshot-based manual evidence rather than an automatic visual-regression assertion.

## 11. Branch and PR lifecycle

Normal lifecycle:

1. create an isolated issue-owned branch from current `main`;
2. open a PR targeting `main`;
3. wait for exact-head `Repository validation` and `Preview readiness`;
4. for Visual PRs, wait for `Preview visual evidence` and inspect its exact-head artifact against current production;
5. perform and record manual visual review when the change is visual;
6. update the branch if `main` advanced; the new head must obtain fresh checks and fresh visual evidence;
7. merge through the protected `main` ruleset only after every server-declared required check is green;
8. verify the post-merge GitHub Pages run;
9. merged same-repository branches are removed by `.github/workflows/branch-cleanup.yml`.

`branch-cleanup.yml` intentionally handles merged PR branches only. Abandoned, no-PR, or deliberately unmerged proof branches require explicit audited cleanup; do not broaden automation to delete arbitrary refs without a separate safe lifecycle policy.

Closing a PR without merge must not change `main`. Its Vercel Preview and visual artifact are non-production evidence and may remain available only for their normal provider/artifact retention windows.

## 12. Troubleshooting matrix

| Symptom                                                        | Likely cause                                                                          | Safe diagnostic                                                                         | Corrective action                                                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| No Vercel evidence for current head                            | Git Integration missing, delayed, or wrong SHA                                        | Compare live PR head with commit statuses and official `vercel[bot]` inspector evidence | Restore integration or wait within the bounded window; never reuse an older Preview                                    |
| `Preview readiness` reports stale head                         | New commit pushed after workflow started                                              | Compare workflow expected SHA with live PR head                                         | Let the new head's workflow run; do not rerun/approve the old head as evidence                                         |
| Vercel status is green but readiness fails                     | Status alone is insufficient, smoke/evidence mismatch may exist                       | Read `Preview readiness` summary/log for inspector and smoke failure                    | Fix the deployment/evidence/smoke problem on a new commit                                                              |
| Preview redirects to Vercel auth                               | Deployment Protection requires automation bypass                                      | Confirm the repository secret name exists; never print its value                        | Configure/rotate `VERCEL_AUTOMATION_BYPASS_SECRET` using Vercel Protection Bypass for Automation                       |
| `Preview visual evidence` fails after readiness succeeds       | Browser capture, localized selector, or protected-origin access regressed             | Inspect the separate evidence job; never expose the secret in diagnostics               | Fix the capture/helper contract without weakening `Preview readiness`; rerun through a new validated head as needed    |
| Visual artifact is missing on a visual change                  | PR body is not marked `- [x] Visual`, evidence job failed, or files were not produced | Check PR change-type checkbox and the `Preview visual evidence` job                     | Correct the PR classification or capture defect; do not mark manual review complete without exact-head evidence        |
| Preview returns fallback `200` for missing route               | Provider/app fallback masks a 404                                                     | Run the readiness smoke and inspect missing-route result                                | Fix routing/fallback configuration; do not weaken the negative smoke check                                             |
| Preview links/assets contain `/PORTFOLIO/`                     | Pages base leaked into Vercel build                                                   | Check `VERCEL`, `VERCEL_URL`, `SITE_URL`, `BASE_PATH` and built markup                  | Restore Vercel base `/`; keep `/PORTFOLIO` only for Pages                                                              |
| `Repository validation` fails before Preview                   | Code/test/format/dependency failure                                                   | Inspect the failing named step/job                                                      | Fix repository validation first; Preview readiness must remain blocked                                                 |
| Chromium install fails on unrelated Google Chrome APT metadata | Hosted runner's unrelated Chrome feed is unhealthy                                    | Inspect the failing Chromium install job                                                | Keep the workflow source-isolation guard and `playwright install --with-deps chromium`; do not skip browser validation |
| Preview wait times out                                         | Provider never reached usable exact-head state within bound                           | Check current-head Vercel status/comment and workflow timestamps                        | Fix provider integration/build or change Preview governance explicitly; do not bypass a red required check             |
| PR stays blocked after checks                                  | Branch not up to date, unresolved conversation, or current-head checks missing        | Read ruleset/check state for the current PR head                                        | Update branch, resolve conversation, then obtain fresh required checks                                                 |
| Required check is red but a role can still merge               | `Protect main` contains an ordinary PR bypass actor                                   | Read the live ruleset with repository-admin visibility                                  | Remove the ordinary bypass actor and run the #142 adversarial red-PR rejection proof                                   |
| Pages validation/build fails after merge                       | Production build regression or transient infrastructure problem                       | Inspect `Deploy to GitHub Pages` jobs on the merge SHA                                  | Fix through a new protected PR; do not promote the Vercel Preview as production                                        |
| Pages deploy job is skipped                                    | `PUBLICATION_APPROVED` is not exactly `true`                                          | Inspect repository variable state without exposing secrets                              | Set the approved publication variable only when production publication is intended                                     |
| Merged branch remains                                          | Cleanup workflow failed or branch is outside its safe conditions                      | Inspect `Clean merged branches` workflow and PR head ownership                          | Retry/fix cleanup; handle unmerged/abandoned refs through audited maintenance                                          |

## 13. Safe reuse in another repository

The reusable design concepts are:

- separate preview and production responsibilities;
- exact-head identity rather than branch-alias trust;
- bounded provider waiting;
- deployed smoke before review-ready;
- least-privilege PR permissions;
- protected-preview automation access isolated to validated Preview requests;
- optional exact-head screenshot artifacts kept separate from required gates;
- stable required check names;
- a protected production branch requiring current-head gates;
- manual visual review tied to the exact validated head.

This repository adapted concepts previously used in AlmaEnBoca, but there is **no runtime dependency** between repositories. The implementation was deliberately evolved instead of copied literally: it does not trust a `Vercel` status context by itself, does not deploy Vercel from GitHub Actions, and cross-checks current GitHub/Vercel evidence before smoke and again after smoke.

When reusing the pattern, re-audit provider behavior, route/base-path requirements, secrets, check names, artifact retention and repository rules rather than copying identifiers blindly.

## 14. Source-of-truth map

Use these maintained files when debugging or changing the system:

- `.github/workflows/validate.yml` — PR validation, Preview readiness and optional visual-evidence orchestration;
- `.github/workflows/deploy.yml` — GitHub Pages production validation/build/deploy;
- `.github/workflows/branch-cleanup.yml` — merged branch cleanup;
- `.github/pull_request_template.md` — manual visual-review contract;
- `vercel.json` — blocks Vercel Git deployments from `main`;
- `astro.config.mjs` and `scripts/lib/hosting-config.mjs` — environment-aware site/base behavior;
- `scripts/preview-readiness.mjs` and `scripts/lib/preview-readiness.mjs` — exact-head readiness entry/orchestration;
- `scripts/lib/vercel-preview-evidence.mjs` and `scripts/lib/vercel-preview-fetch.mjs` — provider evidence and protected smoke isolation;
- `scripts/capture-preview-visual-evidence.mjs` and `scripts/lib/preview-visual-evidence.mjs` — exact-head protected Preview screenshot evidence;
- `tests/preview-readiness-workflow.test.mjs` and `tests/preview-visual-evidence.test.mjs` — workflow/evidence security contracts;
- `docs/operations/MAIN_RULESET_GOVERNANCE.md` — required no-bypass `main` policy and adversarial merge-proof procedure.

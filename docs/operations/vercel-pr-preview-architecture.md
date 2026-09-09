# Vercel PR preview architecture

Status: **Accepted for implementation**  
Owner: Epic #84  
Decision issue: #90

## 1. Purpose

Define the deployment-review architecture that will let every eligible pull request expose a live Vercel preview for the exact commit under review while keeping GitHub Pages as the canonical production target.

This document is an architecture decision, not the deployment implementation. The implementation is intentionally split across #95, #91, #92, #96, #93 and #94.

## 2. Current repository topology

At the time of this decision:

- Astro produces a static site.
- GitHub Pages is the canonical production target.
- Production is served from the project-repository base path `/PORTFOLIO/`.
- `.github/workflows/deploy.yml` handles both pull-request validation and `main` publication.
- that workflow currently uses a workflow-wide `concurrency.group: pages`, so unrelated PR validation and production work can compete for the same concurrency slot;
- that workflow currently grants `pages: write` and `id-token: write` at workflow level even though pull requests never publish Pages;
- `main` is not currently protected by required remote checks;
- there is no Vercel-specific workflow/helper/configuration in repository `main`;
- the connected Vercel account surface inspected during #90 did not expose an accessible PORTFOLIO project, so project/Git linkage must be proven during #91 rather than assumed;
- the current screenshot suite generates review evidence but does not provide an automatic pixel-diff gate.

The existing quality contract remains authoritative: dependency installation/audit, generated-asset validation, CV export, formatting, Astro/TypeScript checks, locale tests, build, Playwright and accessibility coverage.

## 3. Decision

### 3.1 Preview creation

Use **Vercel Git Integration** as the preferred preview-creation mechanism.

An eligible branch/PR push should therefore cause Vercel to create a preview deployment through its native GitHub integration rather than having GitHub Actions create the deployment with a long-lived `VERCEL_TOKEN`.

Reasons:

- avoids duplicating Git lifecycle handling already provided by Vercel;
- minimizes GitHub repository secrets and deployment credentials;
- naturally associates deployments with Git branches, PRs and commit metadata;
- keeps preview creation independent from GitHub Pages production publication;
- makes Vercel disposable as review infrastructure without changing the production hosting model.

If #91 proves that native Git integration cannot satisfy the exact-SHA/repository requirements for this repository, the fallback is an explicit Vercel API/CLI deployment from GitHub Actions. That fallback requires a documented threat/permission model and must not be introduced merely for convenience.

### 3.2 Production target

**GitHub Pages remains canonical production.**

Vercel previews must never promote or replace production from a pull-request workflow. A PR preview is review evidence for a branch commit, not a release target.

Production publication continues to use the existing `PUBLICATION_APPROVED == 'true'` policy unless a later, explicit issue changes it.

### 3.3 Exact-commit identity

A preview is trusted only when its deployment metadata can be tied to the **exact pull-request head SHA**.

Preferred trust evidence:

1. Vercel deployment/Git metadata identifying the GitHub commit SHA (for example provider metadata exposed as `githubCommitSha` or equivalent current Git metadata);
2. a Vercel/GitHub deployment-success event whose payload identifies both the deployment and commit, when the project integration exposes the current `repository_dispatch` model;
3. an exact-SHA deployment lookup through the Vercel API/CLI as a bounded fallback.

The following are **not sufficient trust anchors by themselves**:

- a branch alias URL;
- “latest deployment” for a branch or project;
- an old preview URL copied from an earlier PR commit;
- a GitHub commit status selected only because its context string equals `Vercel`;
- a successful smoke test whose deployment SHA has not been verified.

A new push to a PR invalidates all previous preview-readiness evidence until the new head SHA is independently verified and smoke-tested.

## 4. Event and readiness model

Prefer an event-driven completion path when Vercel Git Integration can emit a deployment-success `repository_dispatch` event with sufficient deployment/Git context.

If event delivery is unavailable or lacks enough exact-SHA data, #92 may perform a bounded exact-SHA lookup through the Vercel API/CLI.

Any polling fallback must have:

- an explicit overall timeout;
- a bounded retry interval;
- immediate failure on terminal deployment failure/error;
- clear diagnostics for missing deployment, stale SHA, provider protection and timeout;
- no unbounded retry loop.

The AlmaEnBoca implementation is a useful precedent for bounded waiting and deployed smoke testing, but PORTFOLIO must not copy its dependency on an exact GitHub status-context name without proving that context remains the current provider contract.

## 5. CI and preview readiness

Repository CI remains the source of truth for code validation.

A preview is **review-ready** only when all of the following refer to the same PR head SHA:

1. the stable repository validation check is green;
2. the Vercel deployment identity has been verified against that SHA;
3. the deployed preview passes the smoke contract from #92.

Preview creation itself may happen in parallel with repository validation, but readiness must not be advertised before all three conditions are true.

The stable automated checks will be finalized by #95/#92 and enforced where supported by #96. Manual visual comparison from #93 is a separate review activity and must not be confused with an automated check.

## 6. Base-path and site-origin contract

The two hosting environments have intentionally different URL bases.

### GitHub Pages production

- `SITE_URL=https://danielgarciaortega-dev.github.io`
- `BASE_PATH=/PORTFOLIO`
- canonical public root: `https://danielgarciaortega-dev.github.io/PORTFOLIO/`

### Vercel PR previews

- `BASE_PATH=/`
- the review URL must come from the actual Vercel deployment, never from a hard-coded branch alias;
- `SITE_URL` must resolve to the deployment origin when the selected integration can provide it safely at build time;
- preview smoke tests must operate on the provider deployment URL directly and must not prepend `/PORTFOLIO/`.

A Vercel preview that renders HTML but serves internal routes/assets under an accidental `/PORTFOLIO/` prefix is considered failed.

Metadata/canonical refinement remains owned by #54. The preview architecture must not invent a second SEO model before #54; it only guarantees correct application routing/assets for the preview origin.

## 7. Security and permissions

### Native Git Integration path

No `VERCEL_TOKEN` should be added to GitHub Actions solely to create previews.

GitHub Actions should follow least privilege:

- PR validation: `contents: read` unless a job proves a stronger permission is required;
- Pages write/OIDC permissions: only in the production publication scope that actually deploys Pages;
- preview-readiness workflow: only the read/check/event permissions required by the selected exact-SHA implementation.

### Optional preview protection

If Vercel deployment protection blocks automated smoke requests, a `VERCEL_AUTOMATION_BYPASS_SECRET`-style secret may be configured for the smoke workflow.

Requirements:

- never log the value;
- never place it in committed configuration;
- inject it only into the request that requires it;
- document its name and purpose, not its value;
- do not disable deployment protection merely to make automation easier.

Project/team identifiers must be treated according to Vercel’s sensitivity requirements and should not be committed when provider/repository configuration can supply them securely.

## 8. Failure semantics

Preview readiness must fail closed when:

- no deployment can be associated with the current PR head SHA;
- the resolved deployment belongs to a stale SHA;
- Vercel reports a terminal build/deployment failure;
- the readiness workflow times out;
- the preview root or required representative routes/assets fail smoke validation;
- the preview leaks the GitHub Pages base path;
- required deployment protection credentials are unavailable for an otherwise protected preview;
- normal repository validation for the same SHA is not green.

Failures must explain the failed stage and the SHA/deployment identity being evaluated without printing credentials.

## 9. Sequencing and ownership

Implementation order for Epic #84 is deliberately strict:

1. **#90** — this architecture decision;
2. **#95** — separate PR validation from Pages concurrency and reduce permissions;
3. **#91** — connect/provision Vercel Git preview deployment and prove exact-commit creation;
4. **#92** — implement exact-head CI + deployed smoke readiness;
5. **#96** — enforce stable automated gates on `main` where the repository plan permits it;
6. **#93** — define the human visual comparison contract;
7. **#94** — consolidate setup, lifecycle and troubleshooting documentation.

No child may merge preview deployment logic back into the production Pages concurrency lock.

## 10. Proof required from #91/#92

Before Epic #84 can close, evidence must show that:

- a real PR head receives a Vercel preview;
- a subsequent commit to the same PR invalidates the previous readiness state;
- the current deployment can be matched to the new exact SHA;
- the preview works from `/` without `/PORTFOLIO/` leakage;
- smoke validation uses the exact deployment URL;
- GitHub Pages production remains unaffected;
- automated checks expose stable names suitable for repository protection;
- no deployment credential is leaked to logs or committed files.

## 11. Deferred decisions

This ADR intentionally does not decide:

- the final bilingual metadata/hreflang model (#54);
- the final CV route/export implementation (#55);
- whether stable UI regions should gain pixel-baseline assertions (#88);
- any migration of canonical production away from GitHub Pages.

Those changes require their own owning issues.

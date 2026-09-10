# GitHub Pages and pull-request validation

This repository has one deployment target: **GitHub Pages**. Pull requests are validated entirely with **GitHub Actions** and repository-local tests. No external PR deployment service is part of the maintained architecture.

## Production

`main` is the production source branch. `.github/workflows/deploy.yml` performs:

1. `Production validation` using the same repository commands required for pull requests;
2. an Astro static build through the official Astro Pages action;
3. `actions/deploy-pages` when the repository variable `PUBLICATION_APPROVED` is `true`.

The canonical project-site origin is:

`https://danielgarciaortega-dev.github.io/PORTFOLIO/`

The application must remain base-safe for `/PORTFOLIO/`.

## Pull-request gates

Protected `main` currently requires two status-check names:

- `Repository validation`;
- `Preview readiness`.

`Repository validation` is the authoritative full gate. It audits dependencies, validates generated assets, exports the CV, checks formatting/types/locales/configuration, builds the site and runs Playwright/axe/responsive coverage.

`Preview readiness` is retained only as a **status-check name** for compatibility with the existing ruleset. Its implementation is GitHub-only: after `Repository validation` succeeds, it checks out the exact PR head, runs the focused Pages contract tests, performs an Astro build using GitHub repository metadata and verifies the required static output. It does not create, query or consume an external Preview deployment.

A new push creates a new head SHA and both required checks must pass for that current head. Do not reuse results from an older commit and do not bypass a failing repository check.

## External Git integration retirement guard

The previously connected Vercel Git integration is not part of the deployment architecture. However, it is still installed outside the repository and can react to Git pushes independently of GitHub Actions.

Until that external project connection is removed in its provider dashboard, the root `vercel.json` is retained only as a **kill switch**:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

Its only allowed purpose is to disable automatic Git deployments for every branch. It must not define build commands, routes, Preview behavior, production behavior, secrets or deployment settings. `tests/github-pages-policy.test.mjs` protects this invariant.

Once the external Git connection has been removed, this final retirement guard can be deleted together with its focused assertion. No GitHub workflow or product code should ever depend on it.

## Local validation

Full contract:

```bash
npm test
```

Focused GitHub Pages/hosting contract:

```bash
npm run test:pages
```

Generated assets when relevant:

```bash
npm run optimize:assets
```

CV output when relevant:

```bash
npm run export:cv
```

Production-equivalent static build with the repository base can be reproduced explicitly with:

```bash
GITHUB_REPOSITORY=danielgarciaortega-dev/PORTFOLIO npm run build
```

For deterministic local E2E hosting, `scripts/serve-e2e.mjs` supplies explicit `SITE_URL` and `BASE_PATH` values.

## Visual changes

Visual correctness is protected by the repository's Playwright assertions, axe checks, responsive/no-overflow coverage and maintained screenshot generation. Screenshots are review evidence, not pixel-diff approval.

For a visual PR, record the exact reviewed head SHA in the PR, run the relevant Playwright coverage and review the maintained viewports. No external Preview URL is required or expected.

## Troubleshooting

If `Repository validation` fails, fix that failure first. It is never a hosting-provider exception.

If `Preview readiness` fails while `Repository validation` is green, inspect the focused Pages contract/build step on that same head. The check is fully repository-controlled, so a red result represents configuration, build or static-output drift that should be fixed before merge.

If the post-merge Pages workflow fails, inspect `Production validation`, `Build Pages artifact` and `Deploy GitHub Pages` separately. Do not introduce another deployment provider as a workaround.

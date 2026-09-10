# Permanent repository instructions for agents

## Objective

Maintain a professional, fast, accessible and maintainable personal portfolio for Daniel García Ortega using only the scope and factual data that belong to this repository.

## Sources of truth

Before changing code, use these maintained repository sources in this order where relevant:

1. `README.md` for the public professional summary and primary links.
2. `docs/operations/FINAL_SHELL.md` for the final bilingual shell, locale-control and utility-placement contract.
3. `docs/operations/GITHUB_PAGES.md` for pull-request validation, protected-main and GitHub Pages operations.
4. `package.json` for scripts, dependencies and execution requirements.
5. `astro.config.mjs` and `scripts/lib/hosting-config.mjs` for static output, hosting and base-path behavior.
6. `src/data/es/` and `src/data/en/` for localized editable content.
7. `src/` for application behavior and shared component structure.
8. `tests/` and `playwright.config.ts` for functional, accessibility, locale, route and responsive contracts.
9. `.github/workflows/` for CI, deployment and repository automation.
10. `input/`, `public/cv/`, `public/en/cv/` and `scripts/` for source assets, generated assets and the standalone bilingual CV/export flow.
11. `docs/operations/BRANCH_LIFECYCLE.md` for abandoned/stale branch retirement.

Do not use historical prompts, old PR descriptions, stale branches or duplicated context packages as the source of truth when maintained repository files or current issues supersede them.

## Non-negotiable rules

1. Do not invent personal data, copy, links, metrics, projects, clients, achievements or technologies.
2. Do not publish data marked private or intentionally excluded.
3. Keep Astro, strict TypeScript and Tailwind CSS 4 unless an approved issue explicitly changes the stack.
4. Do not add React, Vue, Svelte, Next.js or another client framework to this portfolio without an approved requirement.
5. Do not convert the portfolio into a SPA.
6. Do not add a backend, database, CMS, analytics, cookies, dark mode or submission forms without an explicit scope change.
7. Do not use `href="#"`, placeholder content or controls without real behavior.
8. Keep editable application content in the established locale-aware data modules; do not create a third localization mechanism.
9. Spanish and English are first-class public locales. Never replace one locale with the other or globally ban either language.
10. Respect the GitHub Pages `/PORTFOLIO/` base. Internal routes and assets must remain base-safe. Explicit local/test `SITE_URL` and `BASE_PATH` overrides are allowed for deterministic validation.
11. Every interaction must work with keyboard, pointer and touch where applicable.
12. Use semantic HTML and preserve the established accessibility patterns.
13. Keep client-side JavaScript minimal.
14. Do not add dependencies unless they solve a concrete approved requirement.
15. Preserve the standalone CV sources and export flow; never reconstruct either CV locale from screenshots or from a generated PDF.
16. Do not manually edit generated assets in `public/images/` when a corresponding source exists in `input/`; use `npm run optimize:assets`.
17. Keep changes small, issue-owned, coherent and reversible.
18. Never broaden an issue merely to improve unrelated code, copy, infrastructure or design.
19. Never revive, merge, rebase forward or cherry-pick retired implementation branches. New route work must start from current `main`.
20. Distinguish current behavior from approved future routes. Do not document a planned counterpart as already deployed before its owning issue merges.
21. GitHub Pages is the only deployment target. Do not add another deployment or PR-hosting provider without a new explicit architecture decision.

## Current technical decisions

- Astro with static output.
- Strict TypeScript.
- Tailwind CSS 4 through the Vite plugin.
- Astro components without an additional client framework.
- Localized application data under `src/data/es/` and `src/data/en/`.
- Spanish default/root home at `/`.
- English home at `/en/`.
- Spanish projects index at `/proyectos/`.
- English projects index at `/en/projects/`.
- Spanish standalone CV at `/cv/`.
- English standalone CV at `/en/cv/`.
- `/projects/` is not a canonical compatibility route and must remain absent unless separately approved.
- Exactly one target-locale action is rendered per shell surface: Spanish shows `EN`; English shows `ES`.
- Home counterpart switching is `/` ↔ `/en/`.
- Projects counterpart switching is `/proyectos/` ↔ `/en/projects/`.
- CV counterpart switching is `/cv/` ↔ `/en/cv/`, with independent ES/EN PDF outputs generated from the corresponding HTML sources.
- Desktop shell: DGO + GitHub/LinkedIn left, primary navigation center, locale + locale-correct CV right.
- Mobile shell: DGO + menu trigger in the top bar; numbered navigation, socials and locale/CV utilities remain separate inside the menu.
- The public website has no full site footer. Do not confuse that removal with the standalone CV's internal `.professional-footer`.
- Locale-aware canonical/hreflang/Open Graph metadata and the static locale-aware real-404 behavior are delivered and regression-tested.
- GitHub Pages is canonical production and is published from `main` through GitHub Actions.
- Pull requests are validated only through repository-controlled GitHub Actions and tests.
- The active ruleset currently names `Repository validation` and `Preview readiness`. The latter is retained only as a compatibility check name; its implementation is a GitHub-only Pages readiness build and must not depend on an external deployment service.

## Completed bilingual baseline

The former staged bilingual implementation chain is complete and is historical context, not pending execution work:

1. #53 delivered the bilingual project-route counterparts.
2. #54 delivered locale metadata, alternate links, residual accessibility copy and locale-aware 404 semantics.
3. #138 corrected the CV-specific technology claim.
4. #130 → #131 → #132 → #133 delivered the Spanish CV preservation baseline, English CV HTML, dual PDF export and final CV audit.
5. #56 completed the final bilingual residue/routes/regression audit.

Do not recreate that sequence, reopen its retired branches or treat `/en/cv/` as future work. New work must follow the scope and dependencies of the current open issue that owns it.

Repository-hygiene issue #136 physically deleted the audited stale/proof remote refs after confirming they had no required implementation intent or open PR dependencies. Do not describe those refs as pending cleanup or use obsolete ref topology as an implementation source.

## Required validation

Before considering a code or documentation PR ready, use checks proportional to its risk and always require the repository's current-head validation.

For the full repository contract:

```bash
npm test
```

For the focused GitHub Pages/hosting contract:

```bash
npm run test:pages
```

When generated public assets are relevant:

```bash
npm run optimize:assets
```

When the CV or export contract is relevant:

```bash
npm run export:cv
```

`Repository validation` is the authoritative code/test gate and must be green for the final PR head. Do not bypass a formatting, type, build, asset, CV-export, Playwright or other repository-validation failure.

`Preview readiness` is currently only the protected-ruleset status-check name. Its workflow checks the exact pull-request head using GitHub Actions, runs the focused Pages tests, builds the static site and verifies required output. It must contain no external deployment dependency, provider secret or provider URL.

For visual work, use repository Playwright assertions, axe, responsive/no-overflow coverage and maintained screenshot generation. Screenshots are review evidence, not automatic pixel-diff approval. Record the exact reviewed head SHA; a later push invalidates that review.

If a local environment cannot execute a required command, use GitHub Actions for the exact same commit as evidence and state the limitation explicitly.

## Working model

- Start each implementation issue from current `main` unless its maintained dependency contract says otherwise.
- Use one isolated branch and PR per issue/scope where practical.
- Never modify `main` directly for normal work.
- Keep PR descriptions and repository documentation in English.
- Require green current-head `Repository validation` and `Preview readiness` before merge.
- Treat both required checks as repository-controlled correctness gates, not provider availability gates.
- Do not mix cleanup, content, redesign, routes, metadata, CV work and infrastructure unless the owning issue explicitly couples them.
- Re-check routes, base paths and references after structural changes.
- After merge, verify the expected GitHub Pages production lifecycle when the change affects deployable output.
- Report modified files, decisions, validation results and genuine remaining blockers rather than claiming work that tooling could not perform.

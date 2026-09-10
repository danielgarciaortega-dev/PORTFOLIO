# Permanent repository instructions for agents

## Objective

Maintain a professional, fast, accessible and maintainable personal portfolio for Daniel García Ortega using only the scope and factual data that belong to this repository.

## Sources of truth

Before changing code, use these maintained repository sources in this order where relevant:

1. `README.md` for the public professional summary and primary links.
2. `docs/operations/FINAL_SHELL.md` for the final bilingual shell, locale-control and utility-placement contract.
3. `docs/operations/PREVIEW_AND_PAGES.md` for Preview, review-readiness, branch-protection and GitHub Pages operations.
4. `package.json` for scripts, dependencies and execution requirements.
5. `astro.config.mjs` and `scripts/lib/hosting-config.mjs` for static output, hosting and base-path behavior.
6. `src/data/es/` and `src/data/en/` for localized editable content.
7. `src/` for application behavior and shared component structure.
8. `tests/` and `playwright.config.ts` for functional, accessibility, locale, route and responsive contracts.
9. `.github/workflows/` for CI, deployment and repository automation.
10. `input/`, `public/cv/` and `scripts/` for source assets, generated assets and the standalone CV/export flow.
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
10. Respect the GitHub Pages `/PORTFOLIO/` base. Internal routes and assets must remain base-safe, while Preview/local environments use their own root-base contract.
11. Every interaction must work with keyboard, pointer and touch where applicable.
12. Use semantic HTML and preserve the established accessibility patterns.
13. Keep client-side JavaScript minimal.
14. Do not add dependencies unless they solve a concrete approved requirement.
15. Preserve the standalone CV source and export flow; never reconstruct the CV from screenshots or from the generated PDF.
16. Do not manually edit generated assets in `public/images/` when a corresponding source exists in `input/`; use `npm run optimize:assets`.
17. Keep changes small, issue-owned, coherent and reversible.
18. Never broaden an issue merely to “improve” unrelated code, copy, infrastructure or design.
19. Never revive, merge, rebase forward or cherry-pick the retired pre-shell #53/#54 implementation branches. New route work must start from current `main`.
20. Distinguish current behavior from approved future routes. Do not document a planned counterpart as already deployed before its owning issue merges.
21. Never use a repository-role bypass as the ordinary way to merge with `Repository validation` or `Preview readiness` red.

## Current technical decisions

- Astro with static output.
- Strict TypeScript.
- Tailwind CSS 4 through the Vite plugin.
- Astro components without an additional client framework.
- Localized application data under `src/data/es/` and `src/data/en/`.
- Spanish default/root home at `/`.
- English home at `/en/`.
- Exactly one target-locale action is rendered per shell surface: Spanish shows `EN`; English shows `ES`.
- Desktop shell: DGO + GitHub/LinkedIn left, primary navigation center, locale + CV right.
- Mobile shell: DGO + menu trigger in the top bar; numbered navigation, socials and locale/CV utilities remain separate inside the menu.
- The public website has no full site footer. Do not confuse that removal with the standalone CV's internal `.professional-footer`.
- Current projects route: `/proyectos/`. Until #53 merges, both locale shells still target this route. #53 owns the future English counterpart `/en/projects/` and the route-specific locale mapping.
- Current CV route: `/cv/`. Until #55 merges, both locale shells still target this route. #55 owns the future English counterpart `/en/cv/`, CV-local switching and dual PDF output.
- Current custom 404 remains owned by #54 for the final locale-aware metadata/404 pass.
- GitHub Pages is canonical production and is published from `main` through GitHub Actions.
- Vercel, while configured, is Preview/review infrastructure only and must never be promoted as production.
- Vercel Git deployments for `main` remain disabled by repository configuration.
- The active repository ruleset requires pull requests, resolved review conversations, `Repository validation` and `Preview readiness`. Issue #142 owns removal of the current repository-role PR bypass before downstream product merges.

## Route ownership and execution order

Do not collapse the remaining bilingual work into one branch.

The maintained sequence after the completed final-shell Epic is:

1. #98 — repository source-of-truth synchronization.
2. #97 / #136 — complete the audited stale-branch retirement; never use the old #53/#54 refs as implementation bases.
3. #142 — remove the ordinary pull-request bypass of required `main` gates before downstream product merges.
4. #53 — fresh bilingual project-index routes/navigation from the resulting `main`.
5. #54 — locale metadata, alternate links, residual accessibility copy and 404 semantics after #53.
6. #138 — approved CV-specific removal of Vercel from the visible CV technology set and CV-local JSON-LD.
7. #130 → #131 → #132 → #133 — CV preservation baseline, English HTML, dual PDF export and final CV audit.
8. #56 — final bilingual residue/routes/regression audit.

The stale pre-shell #53/#54 refs are retired even if their remote names still physically exist. Their valid intent lives in the maintained issues and documentation, not in their code history.

## Required validation

Before considering a code or documentation PR ready, use the checks proportional to its risk and always require the repository's current-head validation.

For the full repository contract:

```bash
npm test
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

`Preview readiness` validates exact-head Vercel Preview evidence. If Vercel is unavailable, quota-limited or otherwise unable to validate the current head, leave the PR unmerged until that exact-head check is green. Never reuse Preview evidence from another SHA and never use a permission bypass as the ordinary recovery path.

For visual work, preserve the exact-head review semantics in `docs/operations/PREVIEW_AND_PAGES.md`. Screenshots are review evidence, not automatic pixel-diff approval.

If the local environment cannot execute a required command, use CI for the exact same commit as evidence and state the limitation explicitly.

## Working model

- Start each implementation issue from current `main` unless its maintained dependency contract says otherwise.
- Use one isolated branch and PR per issue/scope where practical.
- Never modify `main` directly for normal work.
- Keep PR descriptions and repository documentation in English.
- Require green current-head `Repository validation` and `Preview readiness` before merge.
- Treat external Preview/provider failures as blockers rather than converting permissions into a routine bypass.
- Do not mix cleanup, content, redesign, routes, metadata, CV work and infrastructure unless the owning issue explicitly couples them.
- Re-check routes, base paths and references after structural changes.
- After merge, verify the expected GitHub Pages production lifecycle when the change affects deployable output.
- Report modified files, decisions, validation results and genuine remaining blockers rather than claiming work that tooling could not perform.

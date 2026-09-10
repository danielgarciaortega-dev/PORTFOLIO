# Final bilingual shell contract

This document records the public shell contract established by issues #85–#89. It describes the current shell only; project-route expansion, metadata/404 work, CV work and global source-of-truth cleanup remain owned by later issues.

## 1. Locale entry points

The current public home counterparts are:

- Spanish: `/`
- English: `/en/`

Spanish is the default locale. The active locale is resolved from the path and the explicit user choice is persisted under `portfolio.locale`.

Internal links must remain base-path safe. The production repository is served under `/PORTFOLIO/`, so shell links must use the existing path helpers instead of hard-coded root-relative URLs that would bypass the configured base.

The current locale switcher exposes exactly one action: Spanish pages show `EN` and English pages show `ES`. It links to the currently implemented home counterpart and must not render separate ES and EN controls at the same time.

Project-route counterpart expansion is intentionally not defined here. Issue #53 owns the future bilingual project-route contract. Issue #54 owns bilingual metadata and 404 behavior.

## 2. Desktop header structure

At desktop widths the header has three distinct areas:

1. Left utility area: `DGO` brand plus GitHub and LinkedIn.
2. Primary navigation: Home, About and Projects only.
3. Right utility area: the single target-locale action plus the CV action.

The primary navigation must not contain social links, locale controls or a duplicated CV action.

GitHub and LinkedIn are the only actions retained from the former footer. They belong to the shell utilities and must not be reintroduced as a second footer/navigation cluster.

## 3. Mobile shell structure

The mobile top bar contains only the `DGO` brand and the menu trigger.

Inside the mobile dialog:

- the numbered primary navigation remains a navigation-only region;
- GitHub and LinkedIn live in the explicit social-utility row;
- the target-locale action and CV live in the separate locale/CV utility row.

The mobile menu must preserve keyboard behavior: opening works from the trigger, Escape closes the dialog, and focus returns to the trigger after closing.

The mobile primary navigation must not absorb social, locale or CV controls.

## 4. Footer contract

The public shell has no full footer.

Do not recreate footer chrome merely to host actions already available in the header or mobile utilities. In particular, GitHub, LinkedIn, locale switching and CV access must not be duplicated into a new footer.

The removal is intentional: the previous footer duplicated shell actions and created a second utility surface without adding unique navigation value.

## 5. Dialog ownership after footer removal

Dialog components are mounted only where a real trigger remains.

- Home keeps the About and Contact interactions because visible triggers still exist there.
- `/proyectos/` keeps the About interaction but does not mount the former footer-only Contact dialog or expose a Contact trigger solely for shell parity.

Future shell edits must not leave orphan dialogs mounted after removing their final trigger, and must not add dead triggers without a matching mounted dialog.

## 6. Ownership boundaries

This document intentionally does not redefine adjacent work:

- #53 owns bilingual project routes and project counterpart links.
- #54 owns bilingual metadata and 404 behavior.
- #55 owns bilingual CV HTML/PDF behavior and content.
- #98 owns repository-wide source-of-truth alignment, including stale global documentation such as `AGENTS.md`.

Changes in those scopes must preserve this shell contract unless an explicit later decision supersedes it.

## 7. Regression guards

The final shell is protected primarily by semantic and behavioral tests rather than brittle full-page pixel baselines.

Relevant guards include:

- `tests/shell-regressions.spec.ts` — final ES/EN shell distribution, one locale action, no footer, responsive overflow, mobile utilities, focus restoration, locale persistence and dialog topology;
- `tests/home-locales.spec.ts` — locale action, shell utility placement and mobile behavior;
- `tests/accessibility.spec.ts` — axe coverage for representative pages, dialogs and the open mobile menu;
- `tests/visual.spec.ts` — deterministic screenshot evidence for human review;
- `tests/preview-visual-evidence.test.mjs` and the Preview evidence scripts — exact-head protected Preview evidence infrastructure.

`npm test` remains the aggregate repository validation command.

## 8. Reviewing future visual shell changes

Any future visual shell PR must follow the exact-head Preview contract documented in `docs/operations/PREVIEW_AND_PAGES.md` and the PR template.

A valid review requires:

- `Repository validation` green for the current head;
- `Preview readiness` green for that exact same SHA;
- review of the exact-head Vercel Preview/evidence against current GitHub Pages production;
- the standard 390×844, 768×1024, 1440×900 and 1920×1080 review viewports;
- explicit mobile and desktop inspection;
- no reuse of visual approval from a previous SHA after a new push.

Screenshots are review evidence, not automatic pixel-diff approval. A green automated pipeline does not replace manual visual approval when a PR changes the shell visually.

## 9. Non-duplication rules

A future contributor should treat the following as regressions unless a new product decision explicitly changes the contract:

- displaying both ES and EN controls simultaneously;
- moving locale/social controls into primary navigation;
- duplicating GitHub/LinkedIn/CV across multiple shell regions;
- reintroducing a full footer only to repeat existing actions;
- breaking `/PORTFOLIO/` base-path safety;
- losing locale persistence;
- losing Escape/focus restoration in the mobile menu;
- leaving dialog triggers without mounted dialogs, or mounted dialogs without reachable triggers.

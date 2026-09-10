# Final bilingual shell contract

This document records the delivered public shell and its bilingual route contract. The shell baseline was delivered by #83 after #85, #86, #87 and #88, the project-route counterparts by #53, the locale metadata/404 pass by #54, and the bilingual CV chain by #138 and #130–#133. The final bilingual regression pass was completed by #56. Historical issue or PR descriptions are not the source of truth when this maintained contract or current code/tests supersede them.

## Locale model

Spanish is the default locale at `/`. English is published under `/en/`.

The shell exposes exactly one target-locale action per rendered surface:

- Spanish surfaces show `EN` and label the action as switching to English;
- English surfaces show `ES` and label the action as switching to Spanish;
- the current locale is never rendered as a second language action.

`LanguageSwitcher.astro` owns the one-target control for the Astro shell and reuses the shared locale persistence contract. Shell code must not introduce another locale selector or another persistence mechanism.

Delivered counterpart classes are:

- home: `/` ↔ `/en/`;
- project index: `/proyectos/` ↔ `/en/projects/`;
- standalone CV: `/cv/` ↔ `/en/cv/`.

The standalone CV uses its own minimal locale link while persisting the same `portfolio.locale` preference. Both CV locales have independent PDF outputs generated from their corresponding HTML sources.

## Desktop structure

For desktop widths above 900 px, `Header.astro` keeps three distinct zones.

### Left zone

- `DGO.` remains the brand/home action;
- GitHub and LinkedIn are the only retained former-footer social actions;
- the social actions remain visually secondary to the brand and primary navigation;
- CV, Contact and locale controls do not belong in this zone.

### Center zone

Primary navigation contains only the site navigation/actions owned by the shell:

- Home;
- About;
- Projects.

Locale, CV and social utilities must not be moved into the primary navigation.

### Right zone

- one target-locale action;
- the boxed locale-correct `View CV` / `Ver CV` action immediately beside it: Spanish shell → `/cv/`, English shell → `/en/cv/`.

GitHub and LinkedIn must not be duplicated on the right.

## Mobile structure

At 900 px and below, the desktop three-zone distribution is intentionally not compressed into the top bar.

The top bar contains only:

- `DGO.`;
- the menu trigger.

Inside the mobile dialog/panel:

1. the numbered primary navigation remains a separate navigation block (`01` Home, `02` About, `03` Projects);
2. GitHub and LinkedIn live together in one unnumbered social utility row;
3. the target-locale action and locale-correct CV action live together in a separate unnumbered utility group.

The mobile utility area must not recreate the deleted footer: do not add duplicated brand, role/location copy, Contact, or a full-width footer composition.

## Footer and dialog topology

The public site shell has no full `.site-footer` surface.

The footer removed by #87 must not be reintroduced to recover actions that already exist elsewhere. GitHub and LinkedIn survive through the header/mobile utility placement; CV survives through the right/mobile utility placement.

Dialog mounts must follow actual visible triggers:

- About remains available through shell navigation and therefore requires a valid About dialog mount on routes exposing that trigger;
- Contact is not a shell navigation item; it remains mounted only where an actual visible Contact trigger requires it;
- the Spanish and English projects routes do not carry the old footer-only Contact trigger/dialog introduced for the removed footer topology.

The standalone CV's internal `.professional-footer` is not the deleted website footer. It belongs to both CV documents and remains protected by the CV-specific regression suite.

## Route and base-path constraints

GitHub Pages production is served under `/PORTFOLIO/`. Shell links must therefore be generated through the repository base-path helpers rather than hard-coded as root-only URLs.

Current route behavior:

- `Header.astro` derives `/proyectos/` for Spanish and `/en/projects/` for English from the shared locale route contract;
- `Header.astro` targets `/cv/` for Spanish and `/en/cv/` for English;
- `LanguageSwitcher.astro` maps home counterparts `/` ↔ `/en/` and project counterparts `/proyectos/` ↔ `/en/projects/` through the shared route contract;
- the standalone CV pages map `/cv/` ↔ `/en/cv/` with normal base-safe navigation and persist the explicit locale choice;
- `/projects/` is not a canonical alias and must remain absent unless separately approved;
- canonical/hreflang/Open Graph metadata are locale-aware for the delivered Astro routes;
- the custom static 404 preserves real HTTP 404 semantics, uses locale-aware presentation for English-prefixed missing paths and remains `noindex, follow`.

Do not introduce a second localization mechanism, compatibility aliases or root-only links to work around the established route contract.

## CV output contract

The standalone bilingual CV is a separate static/export surface from the Astro shell:

- Spanish HTML source: `public/cv/index.html`;
- English HTML source: `public/en/cv/index.html`;
- Spanish PDF: `public/cv/CV-Daniel-Garcia-Ortega.pdf`;
- English PDF: `public/en/cv/CV-Daniel-Garcia-Ortega-EN.pdf`;
- `npm run export:cv` exports both definitions from their explicit locale HTML source.

The two locales preserve factual and structural parity while allowing translated recruiter-facing copy. Their A4, print, mobile, accessibility and download behavior is regression-tested. Do not reconstruct either source from a screenshot or generated PDF.

## Regression guards

The final shell is protected primarily by semantic and geometry assertions rather than brittle full-page pixel baselines.

Relevant maintained coverage includes:

- `tests/shell-regressions.spec.ts` — desktop/mobile utility placement, one locale action, no site footer, route-safe switching, dialog topology and supported-width overflow checks;
- `tests/home-locales.spec.ts` and `tests/home-english.spec.ts` — bilingual home shell behavior;
- `tests/projects-locales.spec.ts` — bilingual project routes, localized navigation, project counterpart switching, persistence, mobile overflow and the absent `/projects/` alias;
- `tests/metadata-locales.spec.ts` and `tests/not-found-locales.spec.ts` — locale-aware metadata and real-404 behavior;
- `tests/cv-locales.spec.ts`, `tests/cv-pdf-locales.spec.ts` and the CV audit/export tests — `/cv/` ↔ `/en/cv/`, dual PDF output, structural parity, A4/mobile and accessibility contracts;
- `tests/portfolio.spec.ts` — integrated shell, menu, route and no-footer checks;
- `tests/accessibility.spec.ts` — representative axe coverage for public shell states;
- `tests/visual.spec.ts` — deterministic screenshot generation for human review artifacts, not pixel-diff approval.

A future shell or route change must keep the relevant guards green and add focused coverage when it changes an invariant not already represented.

## Visual review responsibility

Pull-request validation and deployment mechanics are maintained separately in `docs/operations/GITHUB_PAGES.md`. This shell contract does not redefine those infrastructure rules.

Visual changes must be reviewed against the exact current head using repository Playwright, axe, responsive/no-overflow checks and maintained screenshots where relevant. Evidence from another SHA must never be reused. Screenshots are review evidence, not automatic approval.

## Non-duplication rules

Future contributors must not reintroduce any of the following without a separately approved product decision:

- two simultaneous ES/EN controls;
- locale controls inside primary navigation;
- duplicated GitHub/LinkedIn controls in multiple desktop zones;
- duplicated CV actions across desktop zones;
- a full website footer that repeats brand/profile/actions;
- Contact as a footer replacement merely to restore the removed topology;
- a second mobile navigation block for utilities;
- another route/localization mechanism that bypasses the shared home/projects counterpart contract;
- additional CV aliases or another CV-locale persistence mechanism outside `/cv/` ↔ `/en/cv/`.

The intended result is one coherent bilingual shell with explicit ownership boundaries, not a collection of duplicated fallbacks.

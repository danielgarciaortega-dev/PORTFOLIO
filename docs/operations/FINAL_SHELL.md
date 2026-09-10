# Final bilingual shell contract

This document records the public shell delivered by #83 after #85, #86, #87 and #88. It is the maintained structural contract for future shell changes; historical issue or PR descriptions are not the source of truth.

## Locale model

Spanish is the default locale at `/`. English is published under `/en/`.

The shell exposes exactly one target-locale action per rendered surface:

- Spanish surfaces show `EN` and label the action as switching to English;
- English surfaces show `ES` and label the action as switching to Spanish;
- the current locale is never rendered as a second language action.

`LanguageSwitcher.astro` owns the one-target control and reuses the shared locale persistence contract. Shell code must not introduce another locale selector or another persistence mechanism.

At the current #83 boundary, the home counterparts are `/` ↔ `/en/`. Project-index counterpart routing belongs to #53 and CV counterpart routing belongs to #55. Until those issues land, the shell must not invent `/en/projects/` or `/en/cv/` behavior inside unrelated shell work.

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
- the boxed `View CV` / `Ver CV` action immediately beside it.

GitHub and LinkedIn must not be duplicated on the right.

## Mobile structure

At 900 px and below, the desktop three-zone distribution is intentionally not compressed into the top bar.

The top bar contains only:

- `DGO.`;
- the menu trigger.

Inside the mobile dialog/panel:

1. the numbered primary navigation remains a separate navigation block (`01` Home, `02` About, `03` Projects);
2. GitHub and LinkedIn live together in one unnumbered social utility row;
3. the target-locale action and CV action live together in a separate unnumbered utility group.

The mobile utility area must not recreate the deleted footer: do not add duplicated brand, role/location copy, Contact, or a full-width footer composition.

## Footer and dialog topology

The public site shell has no full `.site-footer` surface.

The footer removed by #87 must not be reintroduced to recover actions that already exist elsewhere. GitHub and LinkedIn survive through the header/mobile utility placement; CV survives through the right/mobile utility placement.

Dialog mounts must follow actual visible triggers:

- About remains available through shell navigation and therefore requires a valid About dialog mount on routes exposing that trigger;
- Contact is not a shell navigation item; it remains mounted only where an actual visible Contact trigger requires it;
- the Spanish projects route no longer carries the old footer-only Contact trigger/dialog introduced for the removed footer topology.

The standalone CV's internal `.professional-footer` is not the deleted website footer. It belongs to the CV document and is owned by #55.

## Route and base-path constraints

GitHub Pages production is served under `/PORTFOLIO/`. Shell links must therefore be generated through the repository base-path helpers rather than hard-coded as root-only URLs.

Current transitional ownership matters:

- `Header.astro` still targets `/proyectos/` from both locale shells until #53 introduces the English projects counterpart;
- `Header.astro` still targets `/cv/` from both locale shells until #55 introduces the English CV counterpart;
- #53 owns `/proyectos/` ↔ `/en/projects/` navigation semantics;
- #54 owns canonical/hreflang/Open Graph and locale-aware 404 semantics;
- #55 owns `/cv/` ↔ `/en/cv/`, CV-local locale navigation and both PDF outputs.

Do not solve #53, #54 or #55 inside a shell-only change.

## Regression guards

The final shell is protected primarily by semantic and geometry assertions rather than brittle full-page pixel baselines.

Relevant maintained coverage includes:

- `tests/shell-regressions.spec.ts` — desktop/mobile utility placement, one locale action, no site footer, route-safe home switching, dialog topology and supported-width overflow checks;
- `tests/home-locales.spec.ts` — bilingual home shell behavior;
- `tests/portfolio.spec.ts` — integrated shell, menu, route and no-footer checks;
- `tests/accessibility.spec.ts` — representative axe coverage for public shell states;
- `tests/visual.spec.ts` — deterministic screenshot generation for human review artifacts, not pixel-diff approval.

A future shell change must keep these guards green and add focused coverage when it changes an invariant not already represented.

## Visual review responsibility

Visual-review and deployment mechanics are maintained separately in `docs/operations/PREVIEW_AND_PAGES.md`. This shell contract does not redefine those infrastructure rules.

When exact-head Preview evidence is used, it must correspond to the current PR head; evidence from another SHA must never be reused. Screenshots are review evidence, not automatic approval.

## Non-duplication rules

Future contributors must not reintroduce any of the following without a separately approved product decision:

- two simultaneous ES/EN controls;
- locale controls inside primary navigation;
- duplicated GitHub/LinkedIn controls in multiple desktop zones;
- duplicated CV actions across desktop zones;
- a full website footer that repeats brand/profile/actions;
- Contact as a footer replacement merely to restore the removed topology;
- a second mobile navigation block for utilities;
- shell-owned project/CV locale routes that belong to #53/#55.

The intended result is one coherent bilingual shell with explicit ownership boundaries, not a collection of duplicated fallbacks.
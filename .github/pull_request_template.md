## Scope

Issue: <!-- e.g. #93 -->

Change type:

- [ ] Visual — rendered UI, layout, responsive behavior or visual evidence changes.
- [ ] Non-visual — no intentional rendered UI change.

Summary:

<!-- Concise description of the change and its intended scope. -->

## Required automated gates

Before merge, the current PR head must have:

- [ ] `Repository validation` — success.
- [ ] `Preview readiness` — success for the same current head SHA.

These automated gates do not replace manual visual review when the PR changes rendered UI.

## Visual review

Complete this section only for **Visual** changes. For non-visual changes, do not regenerate screenshots solely to fill this section.

Current reviewed PR head SHA:

`<!-- exact SHA -->`

Validated Vercel Preview URL:

<!-- URL resolved for the exact head by Preview readiness -->

Production comparison target:

`https://danielgarciaortega-dev.github.io/PORTFOLIO/`

Intentionally changed surfaces:

- <!-- route/component/surface -->

Viewports reviewed:

- [ ] 390×844
- [ ] 768×1024
- [ ] 1440×900
- [ ] 1920×1080
- [ ] Mobile behavior reviewed.
- [ ] Desktop behavior reviewed.

Visual evidence / screenshot updates:

<!-- List intentionally regenerated artifacts, or write "None". -->

Expected visual differences:

<!-- Explain intentional differences so they are not mistaken for regressions. -->

- [ ] I reviewed the validated Preview for the exact SHA above against current GitHub Pages production.
- [ ] I understand that any new push invalidates this visual review until the new exact-head Preview is ready and reviewed again.

## Non-visual confirmation

Complete this only for **Non-visual** changes.

- [ ] No rendered UI change is intended, so no visual artifact churn is required.

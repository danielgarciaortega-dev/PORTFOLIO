## Scope

Issue: <!-- e.g. #154 -->

Change type:

- [ ] Visual — rendered UI, layout or responsive behavior changes.
- [ ] Non-visual — no intentional rendered UI change.

Summary:

<!-- Concise description of the change and its intended scope. -->

## Required automated gates

Before merge, the current PR head must have:

- [ ] `Repository validation` — success.
- [ ] `Preview readiness` — success.

`Preview readiness` is retained as a required-check name for protected-main compatibility. It is a GitHub Actions **Pages readiness** check: it does not deploy or validate an external PR Preview.

## Visual review

Complete this section only for **Visual** changes. For non-visual changes, do not regenerate screenshots solely to fill this section.

Current reviewed PR head SHA:

`<!-- exact SHA -->`

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

<!-- List intentionally regenerated Playwright artifacts, or write "None". -->

Expected visual differences:

<!-- Explain intentional differences so they are not mistaken for regressions. -->

- [ ] I reviewed the exact current head using the repository Playwright/axe/responsive checks and the available local/CI visual evidence.
- [ ] I understand that any new push invalidates the recorded head SHA and requires the relevant checks/review again.

## Non-visual confirmation

Complete this only for **Non-visual** changes.

- [ ] No rendered UI change is intended, so no visual artifact churn is required.

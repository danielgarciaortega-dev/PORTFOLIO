# Projects backdrop contrast audit

Issue: #268

Parent: #263

Reviewed production head: `fd8543a3bb4772f731e6a461ffd24a2a6b8f66b6`

Reviewed GitHub Pages run: `36247869920`

Reviewed `github-pages` artifact: `10908455885`

## Purpose

Record the real readability risks of the six project-page backdrop photographs before changing the visual treatment. This is the baseline for #269, #270 and the final QA in #271.

This audit does not introduce dynamic luminance analysis or change runtime behavior.

## Method

The exact GitHub Pages artifact for the reviewed head was extracted and rendered with the production CSS.

Each `moment-01..06.webp` state was frozen independently while preserving the current:

- cream veil
- project layout
- text colors
- tag treatment
- desktop/mobile crop rules
- borders and separators

Reviewed viewports:

- desktop: `1440x900`
- mobile: `390x844`

The backdrop animation itself was disabled only for the audit so that each photograph could be inspected deterministically.

A diagnostic contrast sample was also taken across the rendered bounding boxes of project metadata, titles, descriptions and actions. The sample uses the production computed text color and the 5th-percentile background contrast inside each element box. It is intentionally conservative and is not a formal per-glyph WCAG measurement. It is useful here because it exposes whether the current design depends on favorable parts of a photograph.

## Current visual contract

The current production rules are:

- backdrop overlay: `color-mix(in srgb, var(--color-bg) 56%, transparent)`
- backdrop crop: `object-fit: cover`
- default position: `center 32%`
- `moment-06`: `center 55%`
- animation: `42s` infinite
- one image every `7s`
- entry/exit blur: `24px`
- entry scale: `1.12`
- metadata/description color: `rgb(91 100 115)` / `#5B6473`
- title/action color: `rgb(14 23 42)` / `#0E172A`
- metadata, description and action use three cream `text-shadow` layers
- tags use `#5B6473` over `rgba(255, 255, 255, 0.55)` with the existing light border

## Findings by photograph

### Moment 01

Bright indoor group portrait with alternating light walls, skin tones and dark clothing.

- Desktop: secondary text crosses several dark shirts and medium-tone faces. The cream veil reduces separation instead of creating a stable text plane.
- Mobile: the center crop places people directly behind the first card copy.
- Diagnostic p05 contrast: desktop metadata `1.91:1`, desktop description `1.86:1`, mobile metadata `2.45:1`, mobile description `2.15:1`.

### Moment 02

Large group portrait with very bright ceiling panels, mixed clothing and saturated green floor.

- Desktop: this has the highest spatial variation of the six images. Copy crosses faces, dark clothing and bright areas in the same card.
- Mobile: the first card sits over multiple subjects and the green seating/floor.
- Diagnostic p05 contrast: desktop metadata `1.77:1`, desktop description `1.73:1`, mobile metadata `1.88:1`, mobile description `1.97:1`.

### Moment 03

Presenter in black clothing against a bright wall with a large green plant.

- Desktop: the first card combines dark clothing and foliage while the other columns sit on pale wall/screen regions, so one global cream treatment behaves inconsistently.
- Mobile: the presenter occupies most of the visible crop behind the first project.
- Diagnostic p05 contrast: desktop metadata `1.80:1`, desktop description `1.84:1`, mobile metadata `2.10:1`, mobile description `1.94:1`.

### Moment 04

Close portrait with dark clothing, skin and hair in the center/right, with a blurred presenter in the background.

- Desktop: the portrait is visually dominant and competes with project hierarchy. Secondary text can fall over dark clothing and skin in adjacent columns.
- Mobile: this has the strongest focal competition of the set because a face occupies most of the viewport behind the first project.
- Diagnostic p05 contrast: desktop metadata `1.80:1`, desktop description `1.87:1`, mobile metadata `3.42:1`, mobile description `3.34:1`.

### Moment 05

Award group portrait with a bright white left side and saturated orange display/signage.

- Desktop: mixed dark clothing, white walls and orange signage create abrupt luminance changes under the three cards. The current halo becomes especially visible.
- Mobile: award signage and people remain directly behind copy, creating visual noise even where raw contrast is acceptable.
- Diagnostic p05 contrast: desktop metadata `1.74:1`, desktop description `1.81:1`, mobile metadata `2.21:1`, mobile description `2.27:1`.

### Moment 06

Portrait-oriented outdoor group with pale UGR AI facade/sky and the group in the lower half.

- Desktop: the facade is comparatively calm, but the lower copy crosses the group and award boards.
- Mobile: the existing `center 55%` adjustment is justified because it keeps the group visible. Description contrast still drops over the people/award region.
- Diagnostic p05 contrast: desktop metadata `2.22:1`, desktop description `1.85:1`, mobile metadata `4.80:1`, mobile description `2.05:1`.

## Cross-image conclusions

### Secondary text is the actual contrast failure

The title and primary action use `#0E172A` and remain materially more stable than the secondary copy. Across the six desktop states, the title's sampled p05 contrast stayed above roughly `5.2:1`.

The weak point is `#5B6473` metadata and description text. Desktop p05 values repeatedly fall near `1.7-2.2:1`; mobile descriptions remain roughly `1.9-3.3:1` in the reviewed crops.

The current cream `text-shadow` does not fix that underlying contrast. It instead creates a soft halo that makes the text appear washed out and changes visually with the photograph.

### The cream veil is not a stable contrast strategy

A light translucent veil works against dark text when the source photograph contains both dark subjects and bright walls. It compresses the photograph toward a pale midtone without guaranteeing that muted gray copy remains distinct everywhere.

This is most obvious in moments 02, 03 and 05, which contain strong light/dark transitions under the project columns.

### Tags are comparatively protected, but visually inconsistent

The tag pills already have their own translucent white surface, so they are less dependent on the backdrop than metadata and descriptions. However, their current muted text, cream-toned border and pale fill reinforce the same washed visual language.

#269 should treat tags as part of the light-on-dark system instead of keeping the current cream vocabulary.

### Crop findings for #270

Do not change crop or animation as part of #269.

Candidates to review in #270:

- `moment-04` mobile: the close portrait dominates the first project and creates excessive focal competition
- `moment-05` mobile: award signage and the foreground board sit behind copy
- `moment-06`: keep `center 55%` as the starting point because the default `32%` crop would lose too much of the group
- `moment-02`: verify that desktop/tablet crops keep the group readable without pushing the bright ceiling into too much of the visible frame

## Baseline for #269

The implementation issue should keep the photographs visible but make text contrast independent from the active image.

The baseline direction already approved by #263/#269 is:

1. Replace the cream veil with a stable dark scrim.
2. Move project-page typography to a light hierarchy.
3. Remove the cream multi-layer text halo.
4. Adapt separators and tags to the same dark-scrim system.
5. Do not introduce JavaScript luminance sampling.
6. Do not globally change shared text tokens to solve a page-local problem.

## Before/after comparison protocol

The final comparison in #271 must use the same matrix as this baseline:

- all six moments
- `1440x900`
- `390x844`
- ES and EN
- metadata
- title
- description
- tags
- CTA
- separators
- focus state
- reduced motion

The exact reviewed head above is the **before** reference. The **after** reference must record the final #271 head so that later pushes cannot invalidate the visual review.

## Decision

#268 is an audit-only issue. No runtime style, animation, crop or content changes are required here.

The evidence supports proceeding with #269 before any animation/crop refinements.

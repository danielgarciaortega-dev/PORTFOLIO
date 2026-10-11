# Projects final QA

Issue: #271

Parent: #263

Runtime implementation reviewed: `9a02b1305ad5bbad79304507f9e91846d71da644`

Production GitHub Pages run: `36252632403`

Production `github-pages` artifact: `10910091232`

## Scope

This QA closes the baseline Projects redesign delivered by #268, #269 and #270.

The review covers the current contrast system, the six photographic backdrop states, responsive layout, interaction states, dialogs and reduced motion. It does not include the optional contextual hover/focus backdrop proposed in #272.

No runtime redesign is introduced by #271.

## Evidence source

The reviewed runtime head completed the GitHub Pages production workflow successfully.

The exact production artifact was extracted and checked directly. The generated Spanish Projects page contains:

- six `moment-01..06.webp` backdrop images;
- a shared `48s` animation duration;
- delays of `-2s`, `6s`, `14s`, `22s`, `30s` and `38s`;
- eager loading for moments 01 and 02;
- lazy loading for moments 03 through 06;
- the final desktop and portrait-mobile crop variables from #270;
- the dark Projects base and 66% dark scrim from #269.

The generated English Projects page uses the same shared backdrop contract.

## Visual matrix

The six production photographs were reviewed with the final crop configuration and 66% dark scrim at the maintained reference sizes:

- wide desktop: `1440x900`;
- portrait mobile: `390x844`.

Additional automated layout coverage is maintained for:

- laptop: `1024x900`;
- tablet: `768x1024`.

### Moment 01

- Desktop: the full group remains readable and centered.
- Mobile: the central group survives the portrait crop without an isolated edge subject dominating the frame.
- No special crop exception is required.

### Moment 02

- Desktop: `center 42%` reduces the amount of ceiling while retaining the large group.
- Mobile: the central crop retains the group and green seating/floor context.
- The dark scrim prevents the bright ceiling panels from producing a contrast flash.

### Moment 03

- Desktop: the presenter, plant and screen retain useful context.
- Mobile: `44% center` keeps the presenter as the subject and removes most of the unrelated foreground head on the right.
- The subject remains recognizable without competing excessively with the project copy.

### Moment 04

- Desktop: the close portrait remains intentionally prominent, but the stable scrim keeps it behind the content hierarchy.
- Mobile: `34% center` moves the face toward the right edge and restores background/context on the left.
- This addresses the strongest focal-competition case identified in #268.

### Moment 05

- Desktop: the group, award board and event screen remain readable as one scene.
- Mobile: `38% center` keeps several people in frame instead of centering almost entirely on the foreground award board.
- The orange screen remains visible without becoming the sole focal point.

### Moment 06

- Desktop: `center 55%` remains necessary to retain the group beneath the UGR AI facade.
- Mobile: the centered portrait crop keeps both the building identity and the group.
- The prior 55% desktop exception is preserved rather than generalized to portrait mobile.

## Motion review

The former `42s` / `7s` sequence effectively behaved like adjacent cuts because one image finished almost exactly when the next started.

The final contract uses:

- `48s` total animation duration;
- `8s` step between images;
- a two-second overlap between outgoing and incoming images;
- `10px` entry blur instead of `24px`;
- `1.04` entry scale instead of `1.12`;
- linear animation timing;
- a `-2s` initial offset so the first image is already settled on first paint.

The fixed 66% scrim remains unchanged throughout the crossfade, so the text plane does not brighten or darken with the image transition.

## Reduced motion

With `prefers-reduced-motion: reduce`:

- all backdrop animations are disabled;
- blur is removed;
- transforms are removed;
- moment 01 remains visible;
- moments 02 through 06 remain hidden;
- the fixed backdrop does not contribute to document layout.

This behavior is shared by ES and EN.

## Interaction and accessibility matrix

The #271 Playwright matrix verifies ES and EN at desktop, laptop, tablet and mobile widths.

For each combination it checks:

- exactly three project rows;
- all three project marks are loaded;
- six backdrop images remain present;
- no horizontal overflow;
- each project row stays within the viewport;
- keyboard focus is visible on the project CTA;
- Enter opens the AL-LÍO dialog;
- Escape closes the dialog and restores focus;
- hover keeps the orange CTA interaction state.

A dedicated state test also forces each of the six backdrop images active at desktop and mobile sizes and verifies that changing the photograph does not move the project content or introduce horizontal overflow.

Automated axe coverage includes both Spanish and English Projects routes.

## Contrast

The final Projects system keeps the page-local hierarchy introduced in #269:

- near-white project titles and CTA;
- lighter secondary copy;
- translucent light tag surfaces;
- light separators;
- no cream text halo;
- stable 66% dark scrim.

The global portfolio color tokens remain unchanged.

The photograph itself is therefore treated as atmosphere rather than as the contrast surface for the text.

## Dialogs

Project dialogs remain independent from the backdrop implementation.

Existing project-dialog coverage plus the #271 matrix verifies:

- keyboard opening;
- Escape closing;
- focus restoration;
- ES/EN behavior;
- no dependency on the backdrop animation state.

## Layout stability

The backdrop remains `position: fixed` and isolated behind the Projects content.

The QA regression test explicitly swaps all six active photographs and compares the Projects content bounding box before and after each swap. The active image must not change content position or dimensions.

## Closure criteria

#271 can close only when the exact PR head passes:

- `Repository validation`;
- `Preview readiness`.

Once #271 is merged, #263 can close as the baseline Projects track. #272 remains an optional Phase 2 enhancement and is not required for the baseline closure.

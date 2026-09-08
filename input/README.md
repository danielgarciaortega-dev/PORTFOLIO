# Source assets

`input/assets/` contains the original files used to generate the optimized assets committed under `public/images/` and `public/og-image.webp`.

Run:

```bash
npm run optimize:assets
```

Source groups:

- `profile/`: profile and about photos
- `projects/`: project marks used by the portfolio
- `companies/`: employer/company logos
- `education/`: education logos
- `moments/`: source photos for the `/proyectos/` background sequence

`moment-03.webp` intentionally reuses `profile/profile-main.jpg`; the previous `hero-03.jpg` source was byte-identical, so the duplicate source file was removed.

Do not edit generated files in `public/images/` when a source exists here. Update the source and regenerate the outputs instead.

# Daniel García Ortega — Portfolio

**Full-stack web developer · Granada, Spain**

Second-year student in Web Application Development (DAW) at Instituto FOC. This portfolio brings together my projects, experience, education, and technical work while I look for a company where I can complete my second-year internship and continue growing as a developer.

[View portfolio](https://danielgarciaortega-dev.github.io/PORTFOLIO/) · [View CV](https://danielgarciaortega-dev.github.io/PORTFOLIO/cv/)

## Profile

I spent nearly ten years in customer service and sales before moving into web development. I currently combine my DAW studies with personal projects, hackathons, and hands-on software development experience.

## Featured projects

### AL-LÍO · [Repository](https://github.com/danielgarciaortega-dev/al-lio)

Personal project developed as part of **Aircury Summer of Code 2026** to centralize tasks, calendar, learning, and professional opportunities. My role covers product design, architecture, and full-stack development.

`Next.js` · `TypeScript` · `Tailwind CSS` · `PostgreSQL` · `Supabase` · `Google OAuth` · `Docker`

### SIDN Cost Control

Team-built application for monitoring and comparing advertising campaign spend. **Winner of the 1st GEN AI ARENA**.

`Python` · `FastAPI` · `BigQuery` · `React` · `Vite`

### Feedback2Action

Feedback analysis system that turns large volumes of reviews into grouped problems and prioritized actions.

**22,376 reviews analyzed** · **409 problem groups** · **108 prioritized actions**

`Python` · `FastAPI` · `BigQuery` · `Vertex AI`

## Technical experience

**Salunox — Web Development Intern (2026)**  
Healthcare SaaS platform. Bug fixing and validation of web and mobile functionality related to patients, appointments, and notifications.

`Angular` · `TypeScript` · `Laravel/PHP` · `Flutter/Dart` · `Firebase` · `REST APIs`

## Stack

- **Frontend:** HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Astro, Tailwind CSS, Vite.
- **Backend:** Java, Python, FastAPI, Node.js, REST APIs.
- **Data:** SQL, PostgreSQL, MySQL/MariaDB, BigQuery.
- **Tools:** Git, GitHub, Docker, Supabase.

## About this portfolio

Static multi-page portfolio built with **Astro 7**, **TypeScript** in strict mode, and **Tailwind CSS 4**, with no client-side framework. Profile, project, education, experience, and technology content is kept typed in `src/data/`.

Main routes: `/`, `/proyectos/`, `/cv/`, plus a custom 404 page. Routes and assets respect `import.meta.env.BASE_URL`, so the site works both locally and under `/PORTFOLIO/` on GitHub Pages.

## Development and verification

Requirements: **Node.js 22.12+** and **npm 11**. CI uses Node 24.

```bash
npm ci
npm run dev
```

Main commands:

```bash
npm run build            # static build to dist/
npm run check            # Astro + TypeScript
npm run format:check     # Prettier
npm run test:e2e         # Playwright + axe + visual QA
npm test                 # format + check + build + E2E
npm run optimize:assets  # generate web assets from input/
npm run export:cv        # regenerate the PDF from the HTML CV
```

Playwright covers navigation, routes, responsive behavior, and automated accessibility checks with axe. QA screenshots are kept in `docs/screenshots/`.

## Structure

```text
.github/workflows/  CI and GitHub Pages deployment
docs/               documentation and visual QA evidence
input/              original asset and CV sources
public/             public assets and HTML/CSS/PDF CV
scripts/            optimization, export, and E2E support
src/                components, data, layouts, pages, scripts, styles, and utilities
tests/              functional, accessibility, and visual tests
```

## CI/CD

The `.github/workflows/deploy.yml` workflow uses a single validation pipeline:

- **Pull requests to `main`:** runs `npm test` and builds the Pages artifact; deployment is skipped.
- **Pushes to `main` or manual runs:** repeats validation and build; publishes to GitHub Pages only when `PUBLICATION_APPROVED == 'true'`.

`astro.config.mjs` generates static output and automatically infers `site` and `base` from GitHub Actions, with support for `SITE_URL` and `BASE_PATH` when explicit overrides are needed.

## License

Personal use — code and content by Daniel García Ortega.

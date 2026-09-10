<div align="center">

# Daniel García Ortega

**Full-stack web developer · Granada, Spain**

Second-year Web Application Development (DAW) student building real products, participating in hackathons, and gaining hands-on software development experience.

[**View portfolio**](https://danielgarciaortega-dev.github.io/PORTFOLIO/) · [**English version**](https://danielgarciaortega-dev.github.io/PORTFOLIO/en/) · [**View CV (ES)**](https://danielgarciaortega-dev.github.io/PORTFOLIO/cv/) · [**View CV (EN)**](https://danielgarciaortega-dev.github.io/PORTFOLIO/en/cv/) · [**LinkedIn**](https://linkedin.com/in/daniel-garcía-ortega-404754385/)

</div>

---

## Profile

I spent nearly ten years in customer service and sales before moving into web development. I am currently in my second year of DAW at Instituto FOC and looking for a company where I can complete my internship, keep learning, and contribute from day one.

My recent work combines full-stack development, product thinking, API integrations, databases, cloud services, testing, and deployment.

## Highlights

- **Aircury Summer of Code 2026** — selected with my personal project **AL-LÍO**.
- **1st GEN AI ARENA winner** — team project **SIDN Cost Control**.
- **Salunox** — web development internship on a healthcare SaaS platform.
- **Feedback2Action** — transformed **22,376 reviews** into **409 problem groups** and **108 prioritized actions**.

## Featured projects

### AL-LÍO · [Repository](https://github.com/danielgarciaortega-dev/al-lio)

Personal productivity platform developed as part of **Aircury Summer of Code 2026** to centralize tasks, calendar, learning, and professional opportunities. My work covers product design, architecture, and full-stack development.

`Next.js` · `TypeScript` · `Tailwind CSS` · `PostgreSQL` · `Supabase` · `Google OAuth` · `Docker`

### SIDN Cost Control

Team-built application for monitoring and comparing advertising campaign spend. **Winner of the 1st GEN AI ARENA**.

`Python` · `FastAPI` · `BigQuery` · `React` · `Vite`

### Feedback2Action

Feedback analysis system that turns large volumes of reviews into grouped problems and prioritized actions.

**22,376 reviews analyzed** · **409 problem groups** · **108 prioritized actions**

`Python` · `FastAPI` · `BigQuery` · `Vertex AI`

## Technical experience

### Salunox — Web Development Intern · 2026

Worked on a healthcare SaaS platform, fixing bugs and validating web and mobile functionality related to patients, appointments, and notifications.

`Angular` · `TypeScript` · `Laravel/PHP` · `Flutter/Dart` · `Firebase` · `REST APIs`

## Stack

- **Frontend:** HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Astro, Tailwind CSS, Vite
- **Backend:** Java, Python, FastAPI, Node.js, REST APIs
- **Data:** SQL, PostgreSQL, MySQL/MariaDB, BigQuery
- **Tools:** Git, GitHub, Docker, Supabase

## Bilingual architecture

Spanish and English are first-class portfolio locales. The current public route matrix is:

- Spanish home: `/`
- English home: `/en/`
- Spanish projects: `/proyectos/`
- English projects: `/en/projects/`
- Spanish CV: `/cv/`
- English CV: `/en/cv/`

The shell exposes one target-locale action rather than simultaneous ES/EN controls. Home switches `/` ↔ `/en/`, the projects index switches `/proyectos/` ↔ `/en/projects/`, and the standalone CV switches `/cv/` ↔ `/en/cv/`. The unscoped `/projects/` alias is intentionally not part of the public route contract.

Both CV locales preserve the same factual/structural baseline and have independent downloadable PDF outputs generated from their corresponding HTML source.

The final shell contract and route ownership boundaries are maintained in [`docs/operations/FINAL_SHELL.md`](docs/operations/FINAL_SHELL.md).

## Built, tested and published with

This portfolio is a static, responsive and accessible site built with **Astro 7**, **strict TypeScript**, and **Tailwind CSS 4**.

**GitHub Pages is the only deployment target.** Pull requests are validated entirely with GitHub Actions using formatting, Astro/TypeScript checks, locale/config tests, build validation, Playwright, axe, responsive checks and CV export. No external PR deployment service is required.

Operational details for pull-request gates and GitHub Pages publication are maintained in [`docs/operations/GITHUB_PAGES.md`](docs/operations/GITHUB_PAGES.md).

## License

Personal use — code and content by Daniel García Ortega.

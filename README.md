# Daniel García Ortega — Portfolio

**Desarrollador web full-stack · Granada, España**

Estudiante de 2º curso de Desarrollo de Aplicaciones Web en el Instituto FOC. Este portfolio reúne mis proyectos, experiencia, formación y trabajo técnico mientras busco una empresa donde realizar las prácticas de 2º curso y seguir creciendo como desarrollador.

[Ver portfolio](https://danielgarciaortega-dev.github.io/PORTFOLIO/) · [Ver CV](https://danielgarciaortega-dev.github.io/PORTFOLIO/cv/)

## Perfil

Vengo de casi diez años de experiencia en atención al cliente y ventas antes de dar el salto al desarrollo web. Actualmente combino la formación en DAW con proyectos propios, hackathons y experiencia práctica en desarrollo de software.

## Proyectos destacados

### AL-LÍO

Proyecto propio desarrollado en el contexto de **Aircury Summer of Code 2026** para centralizar tareas, calendario, formación y oportunidades profesionales. Mi rol abarca diseño de producto, arquitectura y desarrollo full-stack.

`Next.js` · `TypeScript` · `Tailwind CSS` · `PostgreSQL` · `Supabase` · `Google OAuth` · `Docker`

[Repositorio](https://github.com/danielgarciaortega-dev/al-lio)

### SIDN Cost Control

Aplicación desarrollada en equipo para controlar y comparar el gasto de campañas publicitarias. **Ganador de la I Edición GEN AI ARENA**.

`Python` · `FastAPI` · `BigQuery` · `React` · `Vite`

### Feedback2Action

Análisis de feedback para convertir grandes volúmenes de reseñas en problemas agrupados y acciones priorizadas.

**22.376 reseñas analizadas** · **409 grupos de problemas** · **108 acciones priorizadas**

`Python` · `FastAPI` · `BigQuery` · `Vertex AI`

## Experiencia técnica

**Salunox — Desarrollador web en prácticas (2026)**  
Plataforma SaaS sanitaria. Corrección de incidencias y validación de funcionalidades web y móviles relacionadas con pacientes, citas y notificaciones.

`Angular` · `TypeScript` · `Laravel/PHP` · `Flutter/Dart` · `Firebase` · `REST APIs`

## Stack

- **Frontend:** HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Astro, Tailwind CSS, Vite.
- **Backend:** Java, Python, FastAPI, Node.js, APIs REST.
- **Datos:** SQL, PostgreSQL, MySQL/MariaDB, BigQuery.
- **Herramientas:** Git, GitHub, Docker, Supabase.

## Sobre este portfolio

Portfolio estático multipágina construido con **Astro 7**, **TypeScript** en modo estricto y **Tailwind CSS 4**, sin framework de cliente. El contenido de perfil, proyectos, formación, experiencia y tecnologías se mantiene tipado en `src/data/`.

Rutas principales: `/`, `/proyectos/`, `/cv/` y una página 404 propia. Las rutas y assets respetan `import.meta.env.BASE_URL` para funcionar tanto en local como bajo `/PORTFOLIO/` en GitHub Pages.

## Desarrollo y verificación

Requisitos: **Node.js 22.12+** y **npm 11**. CI utiliza Node 24.

```bash
npm ci
npm run dev
```

Comandos principales:

```bash
npm run build            # build estático en dist/
npm run check            # Astro + TypeScript
npm run format:check     # Prettier
npm run test:e2e         # Playwright + axe + QA visual
npm test                 # formato + check + build + E2E
npm run optimize:assets  # genera assets web desde input/
npm run export:cv        # regenera el PDF desde el CV HTML
```

Playwright cubre navegación, rutas, comportamiento responsive y accesibilidad automatizada con axe. Las capturas de QA se conservan en `docs/screenshots/`.

## Estructura

```text
.github/workflows/  CI y despliegue de GitHub Pages
docs/               documentación y evidencia visual de QA
input/              fuentes originales de assets y CV
public/             assets públicos y CV HTML/CSS/PDF
scripts/            optimización, exportación y soporte E2E
src/                componentes, datos, layouts, páginas, scripts, estilos y utilidades
tests/              pruebas funcionales, accesibilidad y visuales
```

## CI/CD

El workflow `.github/workflows/deploy.yml` mantiene una única cadena de validación:

- **Pull requests a `main`:** ejecuta `npm test` y compila el artefacto de Pages; el deploy se omite.
- **Push a `main` o ejecución manual:** repite validación y build; publica en GitHub Pages solo cuando `PUBLICATION_APPROVED == 'true'`.

`astro.config.mjs` genera salida estática e infiere automáticamente `site` y `base` desde GitHub Actions, con soporte para `SITE_URL` y `BASE_PATH` cuando se necesiten overrides explícitos.

## Licencia

Uso personal — código y contenido de Daniel García Ortega.

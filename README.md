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

Sitio estático multipágina construido con **Astro 7**, **TypeScript** en modo estricto y **Tailwind CSS 4**, sin framework de cliente. El contenido editable se mantiene tipado en `src/data/` para separar datos y presentación.

Incluye:

- portada con perfil, proyectos, tecnologías, formación y experiencia;
- `/proyectos/`, con detalle de los proyectos;
- `/cv/`, con currículum HTML y descarga en PDF;
- navegación responsive, diálogos accesibles y página 404 propia.

## Desarrollo local

Requisitos: **Node.js 22.12+** y **npm 11**.

```bash
npm ci
npm run dev
```

La aplicación se sirve por defecto en `http://localhost:4321/`.

### Comandos útiles

```bash
npm run dev              # servidor de desarrollo
npm run optimize:assets  # regenerar imágenes optimizadas desde input/
npm run export:cv        # regenerar el PDF del CV desde su HTML
npm run format:check     # comprobar formato con Prettier
npm run check            # validar Astro y TypeScript
npm run build            # compilar a dist/
npm run test:e2e         # Playwright + axe + capturas responsive
npm test                 # formato + tipos + build + E2E
```

## Estructura

```text
src/
  components/     UI reutilizable
  data/           perfil, proyectos, tecnologías, formación y experiencia
  layouts/        layout común
  pages/          inicio, /proyectos/ y 404
  scripts/        interacciones progresivas
  styles/         estilos globales
public/
  cv/             CV en HTML/CSS/PDF
  images/         activos optimizados
input/            fuentes originales de assets y CV
scripts/          optimización, exportación y soporte E2E
tests/            funcional, accesibilidad y visual
docs/             evidencia visual de QA
```

Las rutas internas respetan `import.meta.env.BASE_URL`, por lo que funcionan tanto en local como bajo `/PORTFOLIO/` en GitHub Pages.

## Calidad y despliegue

Las imágenes de `public/images/` se generan desde `input/` con `npm run optimize:assets`. El PDF del CV se regenera con `npm run export:cv`.

GitHub Actions valida formato, tipos, build y E2E antes de publicar el sitio en GitHub Pages desde `main`.

## Licencia

Uso personal — código y contenido de Daniel García Ortega.

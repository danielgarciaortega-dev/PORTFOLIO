# Documentación de QA

Este directorio conserva la documentación activa necesaria para validar el portfolio actual. Las capturas generadas durante QA no se versionan como baselines visuales.

## Operaciones de Preview y producción

El runbook mantenido para Vercel PR Previews, checks exact-head, protección de `main`, GitHub Pages y troubleshooting está en [`operations/PREVIEW_AND_PAGES.md`](operations/PREVIEW_AND_PAGES.md).

Ese documento es la referencia operativa para distinguir Preview de producción, diagnosticar fallos de `Repository validation` / `Preview readiness` y mantener el ciclo PR → revisión → merge → GitHub Pages.

## Modelo visual seleccionado

#88 fija el modelo de QA visual del repositorio: **artefactos deterministas de revisión + aprobación manual sobre el Vercel Preview del head exacto**. No se usan assertions de regresión visual por píxel ni baselines `toHaveScreenshot(...)` versionados.

La protección automática de layout y shell corresponde a tests semánticos, responsive y de accesibilidad. En particular, `tests/shell-regressions.spec.ts` protege la distribución final del header, la ausencia de footer, las utilities ES/EN, el cambio de idioma, el foco y el overflow; `tests/accessibility.spec.ts` mantiene axe sobre estados representativos.

Esta separación es intencionada: evita churn de snapshots frágiles en superficies full-page y, al mismo tiempo, impide describir una captura como si fuera una assertion automática.

## Capturas locales

`tests/visual.spec.ts` sigue generando capturas responsive deterministas con reduced motion, pero las escribe en `artifacts/local-visual-evidence/`. Ese directorio está ignorado por Git y las imágenes son **artefactos locales de revisión**, no baselines ni evidencia canónica de aprobación.

Las antiguas capturas versionadas de `docs/screenshots/` se retiran al adoptar este modelo para evitar que imágenes históricas puedan confundirse con el estado actual del portfolio. Una ejecución local puede regenerar evidencia cuando sea útil sin introducir cambios binarios en el repositorio.

## Evidencia visual del Preview protegido

Las PR marcadas como **Visual** generan un artifact efímero de GitHub Actions llamado `preview-visual-evidence-<PR>-<SHA>` después de que `Preview readiness` haya validado el Vercel Preview del head exacto.

El job separado `Preview visual evidence` captura directamente ese Preview protegido en 390×844, 768×1024, 1440×900 y 1920×1080. Incluye `/`, `/en/` y `/proyectos/`; en las superficies Home de los dos viewports de hasta 900 px también captura el menú móvil abierto. Todas las capturas usan reduced motion. El artifact contiene únicamente imágenes y un `manifest.json` con el SHA, la URL validada y el inventario de capturas.

El bypass de Deployment Protection se inyecta solo en peticiones HTTPS al origen exacto `*.vercel.app` ya validado. El secreto no se imprime, no se escribe en el manifest y no se sube al artifact. La evidencia tiene retención corta y existe para que un revisor pueda inspeccionar el mismo Preview exact-head aunque su navegador no tenga acceso interactivo al scope de Vercel.

Este artifact **no es un tercer gate requerido, no hace pixel-diff y no aprueba visualmente la PR**. `Repository validation` y `Preview readiness` siguen siendo los dos gates automatizados protegidos; la evidencia complementa la revisión manual definida por #93.

## Contrato de revisión visual en PR

La plantilla `.github/pull_request_template.md` separa cambios **Visual** y **Non-visual**.

Para una PR visual, la revisión manual debe registrar:

- SHA exacto del head revisado;
- Vercel Preview validado para ese mismo SHA;
- comparación contra la producción canónica en GitHub Pages;
- superficies modificadas intencionadamente;
- revisión en 390×844, 768×1024, 1440×900 y 1920×1080;
- comprobación explícita de móvil y escritorio;
- artifact exact-head revisado;
- diferencias visuales esperadas.

Cualquier push posterior invalida esa revisión manual hasta que el nuevo head obtenga un nuevo `Preview readiness`, genere evidencia nueva y sea revisado de nuevo.

Los checks obligatorios `Repository validation` y `Preview readiness` son automatizados y permanecen separados de la aprobación visual manual. Una PR visual no debe darse por buena solo porque esos checks estén verdes si el Preview o su evidencia exact-head muestran un problema de layout o despliegue.

Para cambios no visuales no se deben generar evidencias visuales ni introducir churn de capturas solo para completar la plantilla. El job `Preview visual evidence` se omite para esas PR.

Los informes históricos de la implementación inicial no forman parte de la documentación activa del proyecto. El estado actual del repositorio se documenta en `README.md`, `AGENTS.md`, `package.json`, `src/`, `tests/`, `docs/` y `.github/workflows/`.

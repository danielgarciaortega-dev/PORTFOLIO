# Documentación de QA

Este directorio conserva únicamente evidencias útiles para validar el portfolio actual.

## Operaciones de Preview y producción

El runbook mantenido para Vercel PR Previews, checks exact-head, protección de `main`, GitHub Pages y troubleshooting está en [`operations/PREVIEW_AND_PAGES.md`](operations/PREVIEW_AND_PAGES.md).

Ese documento es la referencia operativa para distinguir Preview de producción, diagnosticar fallos de `Repository validation` / `Preview readiness` y mantener el ciclo PR → revisión → merge → GitHub Pages.

## `screenshots/`

Las capturas responsive son generadas por la suite Playwright definida en `tests/visual.spec.ts` y cubren los viewports configurados para móvil, tablet y escritorio.

Actualmente estas capturas son **artefactos de revisión**, no assertions de regresión visual por píxel: `tests/visual.spec.ts` usa `page.screenshot(...)` y no `toHaveScreenshot(...)`. Por tanto, una captura generada por sí sola no demuestra que no exista una regresión visual.

No deben editarse manualmente para ocultar regresiones visuales. Si cambia la interfaz de forma intencionada, las capturas deben regenerarse mediante la suite correspondiente y revisarse como parte del cambio. #88 podrá evolucionar esta estrategia a snapshots deterministas, artefactos de revisión o un modelo híbrido; hasta entonces no debe describirse como un sistema de pixel-diff automático.

## Contrato de revisión visual en PR

La plantilla `.github/pull_request_template.md` separa cambios **Visual** y **Non-visual**.

Para una PR visual, la revisión manual debe registrar:

- SHA exacto del head revisado;
- Vercel Preview validado para ese mismo SHA;
- comparación contra la producción canónica en GitHub Pages;
- superficies modificadas intencionadamente;
- revisión en 390×844, 768×1024, 1440×900 y 1920×1080;
- comprobación explícita de móvil y escritorio;
- capturas/evidencias actualizadas de forma intencionada;
- diferencias visuales esperadas.

Cualquier push posterior invalida esa revisión manual hasta que el nuevo head obtenga un nuevo `Preview readiness` y sea revisado de nuevo.

Los checks obligatorios `Repository validation` y `Preview readiness` son automatizados y permanecen separados de la aprobación visual manual. Una PR visual no debe darse por buena solo porque esos checks estén verdes si el Preview muestra un problema de layout o despliegue.

Para cambios no visuales no se deben regenerar capturas ni introducir churn de evidencias solo para completar la plantilla.

Los informes históricos de la implementación inicial no forman parte de la documentación activa del proyecto. El estado actual del repositorio se documenta en `README.md`, `AGENTS.md`, `package.json`, `src/`, `tests/`, `docs/` y `.github/workflows/`.

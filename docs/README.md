# Documentación de QA

Este directorio conserva únicamente evidencias útiles para validar el portfolio actual.

## `screenshots/`

Las capturas responsive son generadas por la suite Playwright definida en `tests/visual.spec.ts` y cubren los viewports configurados para móvil, tablet y escritorio.

No deben editarse manualmente para ocultar regresiones visuales. Si cambia la interfaz de forma intencionada, las capturas deben regenerarse mediante la suite de pruebas correspondiente y revisarse como parte del cambio.

Los informes históricos de la implementación inicial no forman parte de la documentación activa del proyecto. El estado actual del repositorio se documenta en `README.md`, `AGENTS.md`, `package.json`, `src/`, `tests/` y `.github/workflows/`.

# Documentación de QA

Este directorio conserva únicamente evidencias útiles para validar el portfolio actual.

## Final bilingual shell contract

The maintained shell, locale-control, utility-placement, footer-removal and ownership contract is documented in [`operations/FINAL_SHELL.md`](operations/FINAL_SHELL.md).

That document is the source of truth for the final desktop/mobile shell delivered by #83 and for the boundaries that #53, #54 and #55 must respect.

## Operaciones de Preview y producción

El runbook mantenido para Vercel PR Previews, checks exact-head, protección de `main`, GitHub Pages y troubleshooting está en [`operations/PREVIEW_AND_PAGES.md`](operations/PREVIEW_AND_PAGES.md).

Ese documento es la referencia operativa para distinguir Preview de producción, diagnosticar fallos de `Repository validation` / `Preview readiness` y mantener el ciclo PR → revisión → merge → GitHub Pages.

El ruleset activo de `main` nombra `Repository validation` y `Preview readiness` como checks requeridos. El bypass de rol de repositorio actualmente presente está registrado como defecto de gobernanza en #142 y no forma parte del flujo ordinario: si cualquiera de los dos checks requeridos está rojo, la PR debe permanecer sin fusionar. Una caída, cuota o indisponibilidad externa de Vercel no autoriza reutilizar evidencia de otro SHA, ocultar un fallo ni convertir un permiso de bypass en mecanismo normal de recuperación.

## `screenshots/`

Las capturas responsive son generadas por la suite Playwright definida en `tests/visual.spec.ts` y cubren los viewports configurados para móvil, tablet y escritorio.

El modelo definitivo de QA visual seleccionado por #88 es **híbrido sin pixel-diff automático**:

- las propiedades estables del shell se protegen con assertions Playwright semánticas, de visibilidad, geometría, overflow, foco, locale y accesibilidad;
- `tests/visual.spec.ts` y `Preview visual evidence` generan capturas como artefactos de revisión humana;
- las capturas no son baselines automáticos y no se aprueban mediante `toHaveScreenshot(...)`.

Estas capturas son artefactos de revisión, no assertions de regresión visual por píxel. Por tanto, una captura generada por sí sola no demuestra que no exista una regresión visual. Los tests estructurales deben fallar ante regresiones objetivas y la revisión exact-head debe detectar diferencias visuales que no sea razonable convertir en una assertion estable.

No deben editarse manualmente para ocultar regresiones visuales. Si cambia la interfaz de forma intencionada, las capturas deben regenerarse mediante la suite correspondiente y revisarse como parte del cambio. No se deben introducir snapshots por píxel para superficies dinámicas solo para aparentar una cobertura que sería frágil o generaría churn sin señal útil.

## Evidencia visual del Preview protegido

Las PR marcadas como **Visual** generan además un artifact efímero de GitHub Actions llamado `preview-visual-evidence-<PR>-<SHA>` después de que `Preview readiness` haya validado el Vercel Preview del head exacto.

El job separado `Preview visual evidence` captura directamente ese Preview protegido en 390×844, 768×1024, 1440×900 y 1920×1080. Incluye las superficies `/` y `/en/`, y en los dos viewports de hasta 900 px también captura el menú móvil abierto. El artifact contiene únicamente imágenes y un `manifest.json` con el SHA, la URL validada y el inventario de capturas.

El bypass de Deployment Protection se inyecta solo en peticiones HTTPS al origen exacto `*.vercel.app` ya validado. El secreto no se imprime, no se escribe en el manifest y no se sube al artifact. La evidencia tiene retención corta y existe para que un revisor pueda inspeccionar el mismo Preview exact-head aunque su navegador no tenga acceso interactivo al scope de Vercel.

Este artifact **no es un tercer gate requerido, no hace pixel-diff y no aprueba visualmente la PR**. `Repository validation` y `Preview readiness` siguen siendo los dos checks automatizados protegidos del ruleset; la evidencia complementa la revisión manual definida por #93.

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

Cualquier push posterior invalida esa revisión manual hasta que el nuevo head obtenga un nuevo `Preview readiness` y sea revisado de nuevo. No se puede reciclar una URL, un artifact ni un resultado de otro SHA para justificar el nuevo head.

Los checks obligatorios `Repository validation` y `Preview readiness` permanecen separados de la aprobación visual manual. Una PR visual no debe darse por buena solo porque esos checks estén verdes si el Preview o su evidencia exact-head muestran un problema de layout o despliegue.

Para cambios no visuales no se deben regenerar capturas ni introducir churn de evidencias solo para completar la plantilla. El job `Preview visual evidence` se omite para esas PR.

Los informes históricos de la implementación inicial no forman parte de la documentación activa del proyecto. El estado actual del repositorio se documenta en `README.md`, `AGENTS.md`, `package.json`, `src/`, `tests/`, `docs/` y `.github/workflows/`.

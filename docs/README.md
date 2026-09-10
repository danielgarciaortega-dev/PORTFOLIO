# Documentación de QA

Este directorio conserva únicamente contratos y evidencias útiles para validar el portfolio actual.

## Contrato final del shell bilingüe

El shell, el control de idioma, la colocación de utilidades, la ausencia de footer global y los límites de ownership se documentan en [`operations/FINAL_SHELL.md`](operations/FINAL_SHELL.md).

Ese documento es la fuente de verdad para el shell desktop/mobile entregado por #83 y para los límites que deben respetar #53, #54 y #55.

## Validación y producción

El runbook operativo está en [`operations/GITHUB_PAGES.md`](operations/GITHUB_PAGES.md).

La arquitectura mantenida es simple:

- `GitHub Pages` es el único destino de despliegue;
- `GitHub Actions` ejecuta toda la validación de pull requests;
- `Repository validation` es el gate completo de formato, tipos, datos, build, Playwright, axe, responsive y CV;
- `Preview readiness` conserva temporalmente ese nombre porque el ruleset de `main` lo exige, pero su implementación es únicamente una comprobación GitHub-native de compatibilidad/build para Pages;
- ningún gate depende de un despliegue, URL, cuota o secreto de un proveedor externo.

Un fallo de cualquiera de los checks requeridos debe corregirse en el mismo head antes del merge. No se reutiliza evidencia de otro SHA y no se ocultan fallos mediante bypass.

## `screenshots/`

Las capturas responsive son generadas por la suite Playwright definida en `tests/visual.spec.ts` y cubren los viewports configurados para móvil, tablet y escritorio.

El modelo de QA visual es híbrido sin pixel-diff automático:

- las propiedades estables se protegen con assertions Playwright semánticas, de visibilidad, geometría, overflow, foco, locale y accesibilidad;
- `tests/visual.spec.ts` genera capturas como artefactos de revisión humana;
- las capturas no son baselines automáticos y no se aprueban mediante `toHaveScreenshot(...)`.

Una captura por sí sola no demuestra ausencia de regresiones. Los tests estructurales deben fallar ante problemas objetivos y la revisión humana debe cubrir diferencias visuales que no sea razonable fijar como una assertion estable.

No deben editarse manualmente para ocultar regresiones. Si la interfaz cambia de forma intencionada, las capturas relevantes se regeneran mediante la suite correspondiente y se revisan contra el head exacto del cambio.

## Contrato de revisión visual en PR

La plantilla `.github/pull_request_template.md` separa cambios **Visual** y **Non-visual**.

Para una PR visual deben quedar registrados:

- SHA exacto del head revisado;
- comparación con la producción canónica en GitHub Pages cuando sea relevante;
- superficies modificadas de forma intencionada;
- revisión en 390×844, 768×1024, 1440×900 y 1920×1080;
- comprobación de móvil y escritorio;
- capturas/evidencias actualizadas cuando correspondan;
- diferencias visuales esperadas.

Cualquier push posterior invalida la revisión asociada al SHA anterior. Para cambios no visuales no se deben regenerar capturas ni introducir churn de evidencias solo para completar la plantilla.

Los informes históricos de implementaciones anteriores no son fuente de verdad. El estado actual se documenta en `README.md`, `AGENTS.md`, `package.json`, `src/`, `tests/`, `docs/` y `.github/workflows/`.

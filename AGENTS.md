# Instrucciones permanentes para Codex

## Objetivo

Mantener un portfolio personal profesional, rápido, accesible y mantenible para Daniel García Ortega usando exclusivamente el alcance y los datos actuales de este repositorio.

## Fuentes de verdad

Antes de modificar código, usa como referencia principal:

1. `README.md` para arquitectura, comandos y flujo general del proyecto.
2. `package.json` para scripts y dependencias reales.
3. `src/data/` para perfil, proyectos, tecnologías, formación y experiencia.
4. `src/` para comportamiento y estructura de la aplicación.
5. `tests/` y `playwright.config.ts` para requisitos funcionales, accesibilidad y rutas base.
6. `.github/workflows/deploy.yml` para CI y despliegue.
7. `input/` y `scripts/` para activos fuente y generación del CV/recursos.

No dependas de paquetes de contexto, prompts históricos o documentación duplicada para tomar decisiones sobre el estado actual del proyecto.

## Reglas no negociables

1. No inventes datos personales, textos, enlaces, métricas, proyectos, clientes, logros ni tecnologías.
2. No publiques datos marcados como privados o excluidos.
3. Mantén Astro, TypeScript estricto y Tailwind CSS 4 salvo cambio explícitamente solicitado.
4. No añadas React, Vue, Svelte, Next.js u otro framework de cliente a este portfolio sin una necesidad aprobada.
5. No conviertas el portfolio en una SPA.
6. No añadas backend, base de datos, CMS, analítica, cookies, modo oscuro o formularios de envío salvo cambio de alcance explícito.
7. No uses enlaces `href="#"`, contenido de relleno ni botones sin función.
8. Centraliza el contenido editable en `src/data/`; evita duplicar datos de proyectos o experiencia dentro de componentes.
9. Respeta GitHub Pages y su ruta base. Las rutas internas y activos deben funcionar tanto en local como bajo `/PORTFOLIO/`.
10. Toda interacción debe funcionar con teclado, ratón y pantalla táctil.
11. Usa HTML semántico y conserva los patrones de accesibilidad existentes.
12. Mantén el JavaScript del cliente al mínimo.
13. No agregues dependencias salvo que cubran una necesidad concreta y documentada.
14. Conserva el código fuente del CV y su flujo de exportación; no lo reconstruyas desde capturas o desde el PDF.
15. No edites manualmente los activos generados en `public/images/` cuando exista una fuente correspondiente en `input/`; usa `npm run optimize:assets`.
16. Mantén cambios pequeños, coherentes y reversibles.
17. No alteres el alcance para “mejorarlo” dentro de una issue no relacionada.

## Decisiones técnicas actuales

- Astro con salida estática.
- TypeScript en modo estricto.
- Tailwind CSS 4 mediante plugin de Vite.
- Componentes Astro sin framework cliente.
- Datos de contenido centralizados en módulos TypeScript.
- Sitio en español.
- Página principal `/`.
- Página de proyectos `/proyectos/`.
- CV servido desde `/cv/`.
- Página `404` propia.
- Diálogos nativos para “Sobre mí”, contacto y proyectos.
- Despliegue mediante GitHub Actions y GitHub Pages.

## Validación obligatoria

Antes de dar una tarea de código por terminada, ejecuta cuando el entorno lo permita:

```bash
npm run format:check
npm run check
npm run build
npm run test:e2e
```

El comando agregado equivalente es:

```bash
npm test
```

La suite Playwright debe conservar las comprobaciones de accesibilidad automatizada, rutas base, CV, navegación, comportamiento responsive y capturas en los viewports definidos en `tests/visual.spec.ts`.

Si el entorno impide ejecutar algún comando, indícalo explícitamente y usa el CI del mismo commit como evidencia antes de considerar el cambio listo para merge.

## Forma de trabajo

- Trabaja desde una rama específica por issue.
- No modifiques `main` directamente.
- Exige CI verde para el commit actual de la PR antes de mergear.
- Evita mezclar limpieza, contenido, rediseño y funcionalidad en una misma PR.
- Después de cada cambio estructural relevante comprueba referencias y rutas.
- Entrega un resumen final con archivos modificados, decisiones, validaciones ejecutadas, resultados y pendientes reales.

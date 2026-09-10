# Instrucciones permanentes para Codex

## Objetivo

Mantener un portfolio personal profesional, rápido, accesible y mantenible para Daniel García Ortega usando exclusivamente el alcance y los datos actuales de este repositorio.

## Fuentes de verdad

Antes de modificar código, usa como referencia principal:

1. `README.md` para la presentación profesional y los enlaces públicos del portfolio.
2. `package.json` para scripts, dependencias y requisitos de ejecución reales.
3. `astro.config.mjs` para la configuración de Astro, salida estática y ruta base.
4. `src/data/` para perfil, proyectos, tecnologías, formación y experiencia.
5. `src/` para comportamiento y estructura de la aplicación.
6. `tests/` y `playwright.config.ts` para requisitos funcionales, accesibilidad y rutas base.
7. `.github/workflows/` para CI, despliegue y automatizaciones del repositorio.
8. `docs/operations/FINAL_SHELL.md` para el contrato mantenido del shell bilingüe, selector de idioma, utilities y ausencia de footer.
9. `docs/operations/PREVIEW_AND_PAGES.md` para la separación Vercel Preview / GitHub Pages y el ciclo de validación y despliegue.
10. `docs/operations/BRANCH_LIFECYCLE.md` para el ciclo de vida y retirada segura de ramas.
11. `input/` y `scripts/` para activos fuente y generación del CV/recursos.

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
18. No reintroduzcas el footer completo, un segundo selector de idioma ni utilities duplicadas sin una decisión de producto explícita.
19. No uses un bypass de rol o una excepción manual como flujo ordinario para saltar `Repository validation` o `Preview readiness`.

## Decisiones técnicas actuales

- Astro con salida estática.
- TypeScript en modo estricto.
- Tailwind CSS 4 mediante plugin de Vite.
- Componentes Astro sin framework cliente.
- Datos de contenido centralizados en módulos TypeScript.
- Sitio bilingüe ES/EN: español es el locale por defecto en `/` e inglés se publica bajo `/en/`.
- El shell muestra exactamente una acción hacia el locale alternativo: `EN` en superficies españolas y `ES` en superficies inglesas.
- La selección explícita de locale reutiliza el mecanismo de persistencia existente; no se mantiene un segundo selector ni una segunda fuente de estado.
- En escritorio, DGO + GitHub/LinkedIn pertenecen a la zona izquierda, la navegación primaria queda limpia en el centro y locale + CV pertenecen a la zona derecha.
- En móvil, la barra superior conserva DGO + menú y el panel separa navegación primaria, redes y locale/CV.
- El sitio público no tiene un footer completo `.site-footer`; GitHub, LinkedIn y CV sobreviven mediante las utilities del header/panel móvil.
- La ruta actual de proyectos es `/proyectos/`. La contraparte inglesa `/en/projects/` pertenece al trabajo bilingüe de proyectos (#53) y no debe inventarse dentro de tareas ajenas antes de que ese trabajo aterrice.
- El CV actual se sirve desde `/cv/`. La contraparte inglesa `/en/cv/` y los dos PDFs pertenecen al trabajo bilingüe del CV (#55).
- La semántica locale-aware de canonical, hreflang, Open Graph y 404 pertenece al trabajo de metadata (#54).
- Página `404` propia.
- Diálogos nativos para “Sobre mí”, contacto y proyectos, montados únicamente donde exista un trigger válido.
- GitHub Pages es la producción canónica y se publica mediante GitHub Actions.
- Vercel se usa exclusivamente como infraestructura de Preview/revisión de pull requests, no como producción.

## Validación obligatoria

Antes de dar una tarea de código por terminada, ejecuta cuando el entorno lo permita:

```bash
npm run format:check
npm run check
npm run test:locale
npm run test:config
npm run build
npm run test:e2e
```

El comando agregado equivalente es:

```bash
npm test
```

La suite Playwright debe conservar las comprobaciones de accesibilidad automatizada, rutas base, CV, navegación, comportamiento responsive y capturas en los viewports definidos en `tests/visual.spec.ts`.

Para una PR, los checks protegidos son `Repository validation` y `Preview readiness`. Ambos deben corresponder al head actual; un push posterior invalida la evidencia anterior. Las PR visuales requieren además revisar la evidencia exact-head y seguir `docs/operations/PREVIEW_AND_PAGES.md`.

Si Vercel o cualquier proveedor externo impide `Preview readiness`, deja la PR sin fusionar hasta recuperar una validación válida. No reutilices un Preview de otro SHA y no conviertas un bypass de permisos en el flujo normal.

Si el entorno local impide ejecutar algún comando, indícalo explícitamente y usa el CI del mismo commit como evidencia antes de considerar el cambio listo para merge.

## Forma de trabajo

- Trabaja desde una rama específica por issue.
- No modifiques `main` directamente.
- Exige los checks requeridos verdes para el commit actual de la PR antes de mergear.
- Mantén la rama actualizada con `main` cuando el ruleset exija checks estrictos/up-to-date.
- Evita mezclar limpieza, contenido, rediseño y funcionalidad en una misma PR.
- Después de cada cambio estructural relevante comprueba referencias y rutas.
- Después de un merge que afecte a producción, verifica el workflow de GitHub Pages sobre el SHA fusionado.
- Entrega un resumen final con archivos modificados, decisiones, validaciones ejecutadas, resultados y pendientes reales.

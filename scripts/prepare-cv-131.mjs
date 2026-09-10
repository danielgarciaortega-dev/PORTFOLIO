import { mkdir, readFile, writeFile } from 'node:fs/promises';

const esPath = 'public/cv/index.html';
const enPath = 'public/en/cv/index.html';
const headerPath = 'src/components/layout/Header.astro';

const original = await readFile(esPath, 'utf8');
if (original.includes('data-locale-link')) {
  throw new Error('Spanish CV already contains a locale counterpart control');
}

function replaceRequired(source, from, to) {
  if (!source.includes(from)) throw new Error(`Missing source fragment: ${from}`);
  return source.replace(from, to);
}

function replaceFlexible(source, from, to) {
  const pattern = new RegExp(
    from
      .trim()
      .split(/\s+/)
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('\\s+'),
  );
  if (!pattern.test(source)) throw new Error(`Missing translation source: ${from}`);
  return source.replace(pattern, to);
}

let es = replaceRequired(
  original,
  '        </a>\n    </nav>\n    <div class="cv-sheet"',
  '        </a>\n        <a class="cv-locale-link" href="../en/cv/" lang="en" hreflang="en" aria-label="Ver CV en inglés" data-locale-link="en">EN</a>\n    </nav>\n    <div class="cv-sheet"',
);
es = replaceRequired(
  es,
  '    </script>\n</body>',
  '    </script>\n    <script src="locale.js" defer></script>\n</body>',
);
await writeFile(esPath, es, 'utf8');

let en = original;
const exactReplacements = new Map([
  ['<html lang="es"', '<html lang="en"'],
  [
    'CV de Daniel García Ortega - Desarrollador web full-stack con proyectos SaaS, aplicaciones web e integración de APIs.',
    'Daniel García Ortega CV - Full-stack web developer with SaaS projects, web applications and API integration.',
  ],
  [
    'desarrollador web, full-stack junior, Angular, React, Laravel, FastAPI, APIs REST, bases de datos, Granada, teletrabajo',
    'web developer, junior full-stack, Angular, React, Laravel, FastAPI, REST APIs, databases, Granada, remote work',
  ],
  [
    'Daniel García Ortega - Desarrollador Web Full-Stack',
    'Daniel García Ortega - Full-Stack Web Developer',
  ],
  [
    'Desarrollo web full-stack | React | Angular | FastAPI',
    'Full-stack web development | React | Angular | FastAPI',
  ],
  [
    'CV - Daniel García Ortega | Desarrollador Web Full-Stack',
    'CV - Daniel García Ortega | Full-Stack Web Developer',
  ],
  [
    '"jobTitle": "Desarrollador Web Full-Stack"',
    '"jobTitle": "Full-Stack Web Developer"',
  ],
  ['"addressRegion": "Andalucía"', '"addressRegion": "Andalusia"'],
  ['href="styles.css"', 'href="../../cv/styles.css"'],
  ['src="FOTO CARNET.jpg"', 'src="../../cv/FOTO CARNET.jpg"'],
  [
    'src="al_lio_symbol_transparent.png"',
    'src="../../cv/al_lio_symbol_transparent.png"',
  ],
  [
    'src="gen-ai-arena-winner.png"',
    'src="../../cv/gen-ai-arena-winner.png"',
  ],
  [
    'src="feedback2action-logo.png"',
    'src="../../cv/feedback2action-logo.png"',
  ],
  ['src="salunox-logo.svg"', 'src="../../cv/salunox-logo.svg"'],
  ['src="images.jpg"', 'src="../../cv/images.jpg"'],
  ['src="500x500.jpg"', 'src="../../cv/500x500.jpg"'],
  ['aria-label="Navegación del CV"', 'aria-label="CV navigation"'],
  [
    'aria-label="Volver al portfolio de Daniel García Ortega"',
    'aria-label="Back to Daniel García Ortega portfolio"',
  ],
  ['Volver al portfolio', 'Back to portfolio'],
  ['aria-label="Datos de contacto"', 'aria-label="Contact details"'],
  ['aria-label="Enlaces profesionales"', 'aria-label="Professional links"'],
  [
    'aria-label="GitHub de Daniel García Ortega"',
    'aria-label="Daniel García Ortega GitHub"',
  ],
  [
    'aria-label="LinkedIn de Daniel García Ortega"',
    'aria-label="Daniel García Ortega LinkedIn"',
  ],
  [
    'aria-label="Portfolio de Daniel García Ortega"',
    'aria-label="Daniel García Ortega portfolio"',
  ],
  ['aria-label="Información adicional"', 'aria-label="Additional information"'],
  ['aria-label="Abrir demo de AL-LÍO"', 'aria-label="Open AL-LÍO demo"'],
  ['aria-label="Ver código de AL-LÍO"', 'aria-label="View AL-LÍO source code"'],
  [
    'aria-label="Abrir GitHub de Daniel García Ortega"',
    'aria-label="Open Daniel García Ortega GitHub"',
  ],
  [
    'aria-label="Abrir portfolio de Daniel García Ortega"',
    'aria-label="Open Daniel García Ortega portfolio"',
  ],
  [
    'aria-label="Abrir LinkedIn de Daniel García Ortega"',
    'aria-label="Open Daniel García Ortega LinkedIn"',
  ],
  [
    'alt="Foto de perfil de Daniel García Ortega"',
    'alt="Profile photo of Daniel García Ortega"',
  ],
  ['alt="Logo Feedback2Action"', 'alt="Feedback2Action logo"'],
  ['alt="Logo Salunox"', 'alt="Salunox logo"'],
  ['alt="Logo Konecta"', 'alt="Konecta logo"'],
  ['alt="Logo Alcampo"', 'alt="Alcampo logo"'],
  ['alt="Insignia Gen AI Arena ganador"', 'alt="Gen AI Arena winner badge"'],
]);

for (const [from, to] of exactReplacements) en = replaceRequired(en, from, to);

const translations = [
  ['DESARROLLADOR WEB FULL-STACK', 'FULL-STACK WEB DEVELOPER'],
  [
    'Desarrollador web con experiencia en proyectos SaaS y desarrollo de aplicaciones web. Trabajo principalmente con React, Angular, TypeScript, Python y FastAPI, tanto en frontend como en integración de APIs.',
    'Web developer with experience in SaaS projects and web application development. I primarily work with React, Angular, TypeScript, Python and FastAPI, across frontend development and API integration.',
  ],
  ['Discapacidad reconocida: 34%', 'Recognized disability: 34%'],
  ['Disponibilidad inmediata', 'Available immediately'],
  ['Carné B y vehículo propio', 'Category B driving licence and own vehicle'],
  ['Proyectos destacados', 'Featured projects'],
  ['Código ↗', 'Code ↗'],
  [
    'AL-LÍO centraliza tareas, calendario, formación y oportunidades profesionales para reducir la fragmentación entre distintas herramientas.',
    'AL-LÍO centralizes tasks, calendar, learning and professional opportunities to reduce fragmentation across different tools.',
  ],
  ['Ganador · I Edición GEN AI ARENA', 'Winner · 1st GEN AI ARENA edition'],
  [
    'Aplicación desarrollada en equipo para controlar y comparar el gasto de campañas publicitarias. Backend con FastAPI y BigQuery, y panel de gestión desarrollado con React y Vite.',
    'Team-developed application to track and compare advertising campaign spend. Backend built with FastAPI and BigQuery, with a management dashboard built with React and Vite.',
  ],
  ['I Edición GEN AI ARENA', '1st GEN AI ARENA edition'],
  [
    'Analicé 22.376 reseñas mediante Python y BigQuery, obteniendo 409 grupos de problemas y 108 acciones priorizadas con ayuda de Vertex AI.',
    'Analyzed 22,376 reviews with Python and BigQuery, producing 409 issue groups and 108 prioritized actions with support from Vertex AI.',
  ],
  ['Experiencia profesional', 'Professional experience'],
  ['PRÁCTICAS', 'INTERNSHIP'],
  ['Desarrollador web en prácticas', 'Web developer intern'],
  ['Plataforma SaaS sanitaria', 'Healthcare SaaS platform'],
  [
    'Corrección de incidencias y validación de funcionalidades web y móviles relacionadas con pacientes, citas y notificaciones.',
    'Bug fixing and validation of web and mobile features related to patients, appointments and notifications.',
  ],
  ['TELETRABAJO', 'REMOTE'],
  ['Venta telefónica y atención al cliente', 'Telephone sales and customer service'],
  [
    'Venta telefónica y atención al cliente. Gestión de objeciones, resolución de consultas y seguimiento diario de objetivos comerciales.',
    'Telephone sales and customer service. Objection handling, query resolution and daily follow-up against sales targets.',
  ],
  ['PRESENCIAL', 'ON-SITE'],
  [
    'Atención al cliente en tienda, resolución de incidencias y apoyo en la operativa diaria junto al resto del equipo.',
    'In-store customer service, incident resolution and support for daily operations alongside the team.',
  ],
  ['Atención al cliente', 'Customer service'],
  ['Stack técnico', 'Technical stack'],
  ['Datos e integraciones', 'Data & integrations'],
  ['Herramientas', 'Tools'],
  ['Formación académica', 'Education'],
  ['2025 – Actualidad', '2025 – Present'],
  [
    'FP Grado Superior en Desarrollo de Aplicaciones Web',
    'Advanced Vocational Training in Web Application Development',
  ],
  ['Técnico en Gestión Administrativa', 'Technician in Administrative Management'],
  ['Idiomas', 'Languages'],
  ['Español', 'Spanish'],
  ['Nativo', 'Native'],
  ['Inglés', 'English'],
  ['Intermedio', 'Intermediate'],
];
for (const [from, to] of translations) en = replaceFlexible(en, from, to);

const downloadBlock = /\n\s*<nav class="cv-page-landmark" aria-label="Acciones del CV">[\s\S]*?<a class="download-btn"[\s\S]*?<\/a>\s*<\/nav>\s*/;
if (!downloadBlock.test(en)) throw new Error('Could not locate the English PDF control boundary');
en = en.replace(downloadBlock, '\n');
en = replaceRequired(
  en,
  '        </a>\n    </nav>\n    <div class="cv-sheet"',
  '        </a>\n        <a class="cv-locale-link" href="../../cv/" lang="es" hreflang="es" aria-label="View CV in Spanish" data-locale-link="es">ES</a>\n    </nav>\n    <div class="cv-sheet"',
);
en = replaceRequired(
  en,
  '    </script>\n</body>',
  '    </script>\n    <script src="../../cv/locale.js" defer></script>\n</body>',
);
await mkdir('public/en/cv', { recursive: true });
await writeFile(enPath, en, 'utf8');

const header = await readFile(headerPath, 'utf8');
await writeFile(
  headerPath,
  replaceRequired(
    header,
    "const cvUrl = withBase('cv/');",
    "const cvUrl = withBase(locale === 'en' ? 'en/cv/' : 'cv/');",
  ),
  'utf8',
);

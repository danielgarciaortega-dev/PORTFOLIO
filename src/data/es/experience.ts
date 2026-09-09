import type { Experience } from '../types';

export const experience: Experience[] = [
  {
    company: 'Salunox',
    role: 'Desarrollador web en prácticas',
    period: '2026 — 2026',
    mode: 'Prácticas',
    context: 'Plataforma SaaS sanitaria',
    description:
      'Corrección de incidencias y validación de funcionalidades web y móviles relacionadas con pacientes, citas y notificaciones.',
    technologies: [
      'Angular',
      'TypeScript',
      'Laravel/PHP',
      'Flutter/Dart',
      'Firebase',
      'REST APIs',
    ],
    logo: 'images/companies/salunox.svg',
  },
  {
    company: 'Konecta',
    role: 'Venta telefónica y atención al cliente',
    period: '2023 — 2026',
    mode: 'Teletrabajo',
    description:
      'Venta telefónica de servicios de energía, gestión de objeciones, resolución de consultas y seguimiento diario de objetivos comerciales.',
    technologies: [],
    logo: 'images/companies/konecta.webp',
  },
  {
    company: 'Alcampo',
    role: 'Atención al cliente',
    period: '2017 — 2023',
    mode: 'Presencial',
    description:
      'Atención al cliente en tienda, resolución de incidencias y apoyo en la operativa diaria junto al resto del equipo.',
    technologies: [],
    logo: 'images/companies/alcampo.webp',
  },
];

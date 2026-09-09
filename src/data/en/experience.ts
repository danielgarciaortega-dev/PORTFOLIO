import type { Experience } from '../types';

export const experience: Experience[] = [
  {
    company: 'Salunox',
    role: 'Web Development Intern',
    period: '2026 — 2026',
    mode: 'Internship',
    context: 'Healthcare SaaS platform',
    description:
      'Fixed issues and validated web and mobile features related to patients, appointments and notifications.',
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
    role: 'Telesales and Customer Service',
    period: '2023 — 2026',
    mode: 'Remote',
    description:
      'Sold energy services by phone, handled objections, resolved customer queries and tracked daily sales targets.',
    technologies: [],
    logo: 'images/companies/konecta.webp',
  },
  {
    company: 'Alcampo',
    role: 'Customer Service',
    period: '2017 — 2023',
    mode: 'On-site',
    description:
      'Provided in-store customer service, resolved issues and supported day-to-day operations with the wider team.',
    technologies: [],
    logo: 'images/companies/alcampo.webp',
  },
];

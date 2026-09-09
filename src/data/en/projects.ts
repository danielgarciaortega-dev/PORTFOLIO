import type { Project } from '../types';

export const projects: Project[] = [
  {
    id: 'al-lio',
    title: 'AL-LÍO',
    shortDescription:
      'AL-LÍO brings tasks, calendar, learning and professional opportunities into one place to reduce switching between separate tools.',
    modalDescription:
      'AL-LÍO brings tasks, calendar, learning and professional opportunities into one place to reduce switching between separate tools.',
    objective:
      'Reduce fragmentation across task managers, calendars and professional opportunity portals.',
    solution:
      'A single interface for managing tasks, calendar, learning and opportunity tracking.',
    context: 'Aircury Summer of Code 2026',
    role: 'Product design, architecture and full-stack development.',
    status: 'en-desarrollo',
    featured: true,
    technologies: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'PostgreSQL',
      'Supabase',
      'Google OAuth',
      'Docker',
    ],
    image: 'images/projects/al-lio.webp',
    imageAlt: 'AL-LÍO brand symbol',
    repositoryUrl: 'https://github.com/danielgarciaortega-dev/al-lio',
    liveUrl: 'https://al-lio.danielcode.dev',
    eventUrl: null,
    award: null,
    metrics: [],
  },
  {
    id: 'sidn-cost-control',
    title: 'SIDN Cost Control',
    shortDescription:
      'Team-built application for tracking and comparing advertising campaign spend.',
    modalDescription:
      'SIDN Cost Control provides a management dashboard for viewing and comparing advertising campaign spend.',
    objective:
      'Make it easier to track and compare advertising campaign spend.',
    solution:
      'Team-built application with a FastAPI and BigQuery backend and a management dashboard built with React and Vite.',
    context: 'I Edición GEN AI ARENA',
    role: null,
    status: 'premiado',
    featured: true,
    technologies: ['Python', 'FastAPI', 'BigQuery', 'React', 'Vite'],
    image: 'images/projects/sidn-cost-control.webp',
    imageAlt: 'GEN AI ARENA winner badge',
    repositoryUrl: null,
    liveUrl: null,
    eventUrl: 'https://www.arenasidn.com/edicion-1',
    award: 'Winner of I Edición GEN AI ARENA',
    metrics: [],
  },
  {
    id: 'feedback2action',
    title: 'Feedback2Action',
    shortDescription:
      'Review analysis that groups recurring problems and prioritizes actions using data and AI.',
    modalDescription:
      'Feedback2Action turns large volumes of reviews into grouped problems and prioritized actions.',
    objective:
      'Turn large, scattered feedback into grouped problems and actionable decisions.',
    solution:
      'Analyzed 22,376 reviews with Python and BigQuery, producing 409 problem groups and 108 prioritized actions with Vertex AI.',
    context: 'I Edición GEN AI ARENA',
    role: null,
    status: 'finalizado',
    featured: true,
    technologies: ['Python', 'FastAPI', 'BigQuery', 'Vertex AI'],
    image: 'images/projects/feedback2action.webp',
    imageAlt: 'Feedback2Action visual identity',
    repositoryUrl: null,
    liveUrl: null,
    eventUrl: 'https://www.arenasidn.com/edicion-1',
    award: null,
    metrics: [
      '22,376 reviews analyzed',
      '409 problem groups',
      '108 prioritized actions',
    ],
  },
];

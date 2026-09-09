import type { Locale } from './locale';

interface ProjectCopy {
  eyebrow: string;
  technologiesFor: (title: string) => string;
  viewProject: string;
  viewProjectAria: (title: string) => string;
  openDemoAria: (title: string) => string;
  openDemoTitle: string;
  viewCodeAria: (title: string) => string;
  viewCodeTitle: string;
  viewEventAria: (title: string) => string;
  viewEventTitle: string;
  closeAria: (title: string) => string;
  objective: string;
  solution: string;
  resultsFor: (title: string) => string;
  role: string;
  nextProject: string;
}

export const projectCopy: Record<Locale, ProjectCopy> = {
  es: {
    eyebrow: 'PROYECTO',
    technologiesFor: (title) => `Tecnologías de ${title}`,
    viewProject: 'Ver proyecto',
    viewProjectAria: (title) => `Ver proyecto ${title}`,
    openDemoAria: (title) => `Abrir demo de ${title}`,
    openDemoTitle: 'Abrir demo',
    viewCodeAria: (title) => `Ver código de ${title}`,
    viewCodeTitle: 'Ver código',
    viewEventAria: (title) => `Ver evento de ${title}`,
    viewEventTitle: 'Ver evento',
    closeAria: (title) => `Cerrar ${title}`,
    objective: 'Objetivo',
    solution: 'Solución',
    resultsFor: (title) => `Resultados de ${title}`,
    role: 'Rol',
    nextProject: 'Siguiente proyecto',
  },
  en: {
    eyebrow: 'PROJECT',
    technologiesFor: (title) => `Technologies for ${title}`,
    viewProject: 'View project',
    viewProjectAria: (title) => `View project ${title}`,
    openDemoAria: (title) => `Open ${title} demo`,
    openDemoTitle: 'Open demo',
    viewCodeAria: (title) => `View ${title} code`,
    viewCodeTitle: 'View code',
    viewEventAria: (title) => `View ${title} event`,
    viewEventTitle: 'View event',
    closeAria: (title) => `Close ${title}`,
    objective: 'Objective',
    solution: 'Solution',
    resultsFor: (title) => `Results for ${title}`,
    role: 'Role',
    nextProject: 'Next project',
  },
};

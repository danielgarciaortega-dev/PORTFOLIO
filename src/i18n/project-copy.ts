import type { Locale } from './locale';

interface ProjectCopy {
  eyebrow: string;
  technologiesFor: (title: string) => string;
  viewProject: string;
  viewProjectAria: (title: string) => string;
  openAppAria: (title: string) => string;
  openAppLabel: string;
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
    openAppAria: (title) => `Abrir aplicación ${title}`,
    openAppLabel: 'Abrir app',
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
    openAppAria: (title) => `Open ${title} application`,
    openAppLabel: 'Open app',
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

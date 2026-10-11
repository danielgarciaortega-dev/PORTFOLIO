import type { Locale } from './locale';

interface AboutPageCopy {
  currentFocus: string;
  journey: string;
  contribution: string;
  seeking: string;
  continue: string;
  projectsAction: string;
  cvAction: string;
  contactAction: string;
}

export const aboutPageCopy: Record<Locale, AboutPageCopy> = {
  es: {
    currentFocus: 'Ahora',
    journey: 'Recorrido',
    contribution: 'Qué aporto',
    seeking: 'Qué busco',
    continue: 'Seguir',
    projectsAction: 'Ver proyectos',
    cvAction: 'Ver CV',
    contactAction: 'Contactar',
  },
  en: {
    currentFocus: 'Now',
    journey: 'Journey',
    contribution: 'What I bring',
    seeking: "What I'm looking for",
    continue: 'Continue',
    projectsAction: 'View projects',
    cvAction: 'View CV',
    contactAction: 'Contact',
  },
};

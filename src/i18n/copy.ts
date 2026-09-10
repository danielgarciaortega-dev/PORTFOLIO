import type { Locale } from './locale';

interface ShellCopy {
  skipLink: string;
  brandHomeLabel: string;
  mainNavigation: string;
  home: string;
  about: string;
  projects: string;
  viewCv: string;
  openMenu: string;
  navigation: string;
  closeMenu: string;
  mobileNavigation: string;
  mobileViewCv: string;
  languageSwitcher: string;
  spanish: string;
  english: string;
  currentLanguage: string;
  switchToSpanish: string;
  switchToEnglish: string;
}

interface HomeCopy {
  viewProfile: string;
  contact: string;
  projects: string;
  viewAll: string;
  viewAllProjects: string;
  professionalOverview: string;
  technologies: string;
  education: string;
  experience: string;
}

interface DialogCopy {
  aboutEyebrow: string;
  viewGitHub: string;
  viewLinkedIn: string;
  closeAbout: string;
  educationAndProjects: string;
  seeking: string;
  contactEyebrow: string;
  closeContact: string;
  contactTitle: string;
  contactIntro: string;
  copyEmail: string;
  copySuccess: string;
  copyFallback: string;
}

interface NotFoundCopy {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  body: string;
  homeAction: string;
  projectsAction: string;
}

export const shellCopy: Record<Locale, ShellCopy> = {
  es: {
    skipLink: 'Saltar al contenido',
    brandHomeLabel: 'DGO., ir al inicio',
    mainNavigation: 'Navegación principal',
    home: 'Inicio',
    about: 'Sobre mí',
    projects: 'Proyectos',
    viewCv: 'Ver CV',
    openMenu: 'Abrir menú',
    navigation: 'Navegación',
    closeMenu: 'Cerrar menú',
    mobileNavigation: 'Navegación móvil',
    mobileViewCv: 'Consultar CV',
    languageSwitcher: 'Idioma',
    spanish: 'Español',
    english: 'English',
    currentLanguage: 'idioma actual',
    switchToSpanish: 'Cambiar a español',
    switchToEnglish: 'Cambiar a inglés',
  },
  en: {
    skipLink: 'Skip to content',
    brandHomeLabel: 'DGO., home',
    mainNavigation: 'Main navigation',
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    viewCv: 'View CV',
    openMenu: 'Open menu',
    navigation: 'Navigation',
    closeMenu: 'Close menu',
    mobileNavigation: 'Mobile navigation',
    mobileViewCv: 'View CV',
    languageSwitcher: 'Language',
    spanish: 'Spanish',
    english: 'English',
    currentLanguage: 'current language',
    switchToSpanish: 'Switch to Spanish',
    switchToEnglish: 'Switch to English',
  },
};

export const homeCopy: Record<Locale, HomeCopy> = {
  es: {
    viewProfile: 'Conocer mi perfil',
    contact: 'Contactar',
    projects: 'Proyectos',
    viewAll: 'Ver todos',
    viewAllProjects: 'Ver todos los proyectos',
    professionalOverview: 'Resumen profesional',
    technologies: 'Tecnologías',
    education: 'Formación',
    experience: 'Experiencia',
  },
  en: {
    viewProfile: 'View profile',
    contact: 'Contact',
    projects: 'Projects',
    viewAll: 'View all',
    viewAllProjects: 'View all projects',
    professionalOverview: 'Professional overview',
    technologies: 'Technologies',
    education: 'Education',
    experience: 'Experience',
  },
};

export const dialogCopy: Record<Locale, DialogCopy> = {
  es: {
    aboutEyebrow: 'SOBRE MÍ',
    viewGitHub: 'Ver GitHub',
    viewLinkedIn: 'Ver LinkedIn',
    closeAbout: 'Cerrar Sobre mí',
    educationAndProjects: 'Formación y proyectos',
    seeking: 'Qué busco',
    contactEyebrow: 'CONTACTO',
    closeContact: 'Cerrar Contacto',
    contactTitle: 'Hablemos.',
    contactIntro: 'Escríbeme por correo o encuéntrame en mis perfiles.',
    copyEmail: 'Copiar correo',
    copySuccess: 'Correo copiado',
    copyFallback:
      'Correo seleccionado. Pulsa Ctrl+C o Comando+C para copiarlo.',
  },
  en: {
    aboutEyebrow: 'ABOUT',
    viewGitHub: 'View GitHub',
    viewLinkedIn: 'View LinkedIn',
    closeAbout: 'Close About',
    educationAndProjects: 'Education and projects',
    seeking: "What I'm looking for",
    contactEyebrow: 'CONTACT',
    closeContact: 'Close Contact',
    contactTitle: 'Get in touch.',
    contactIntro: 'Email me or find me on LinkedIn and GitHub.',
    copyEmail: 'Copy email',
    copySuccess: 'Email copied',
    copyFallback: 'Email selected. Press Ctrl+C or Command+C to copy it.',
  },
};

export const notFoundCopy: Record<Locale, NotFoundCopy> = {
  es: {
    title: 'Página no encontrada · Daniel García Ortega',
    description: 'La página solicitada no existe.',
    eyebrow: 'ERROR 404',
    heading: 'Esta ruta no forma parte del proyecto.',
    body: 'Vuelve al inicio o consulta los proyectos seleccionados.',
    homeAction: 'Volver al inicio',
    projectsAction: 'Ver proyectos',
  },
  en: {
    title: 'Page not found · Daniel García Ortega',
    description: 'The requested page does not exist.',
    eyebrow: 'ERROR 404',
    heading: 'This route is not part of the project.',
    body: 'Return home or browse the selected projects.',
    homeAction: 'Back to home',
    projectsAction: 'View projects',
  },
};

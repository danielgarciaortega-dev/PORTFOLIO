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
  viewCvAria: string;
  contactAria: string;
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
    viewCvAria: 'Ver CV',
    contactAria: 'Contactar',
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
    viewCvAria: 'View CV',
    contactAria: 'Contact',
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
    copyFallback:
      'Email selected. Press Ctrl+C or Command+C to copy it.',
  },
};

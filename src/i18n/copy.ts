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

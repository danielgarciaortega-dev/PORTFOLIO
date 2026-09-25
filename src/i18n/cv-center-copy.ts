import type { Locale } from './locale';

export interface CvCenterOptionCopy {
  label: string;
  description: string;
}

export interface CvCenterCopy {
  eyebrow: string;
  title: string;
  intro: string;
  designedGroup: string;
  designedMeta: string;
  designedDescription: string;
  atsGroup: string;
  atsMeta: string;
  atsDescription: string;
  designedEs: CvCenterOptionCopy;
  designedEn: CvCenterOptionCopy;
  atsEs: CvCenterOptionCopy;
  atsEn: CvCenterOptionCopy;
  optionAria: (format: string, label: string) => string;
}

export const cvCenterCopy: Record<Locale, CvCenterCopy> = {
  es: {
    eyebrow: 'CURRÍCULUM',
    title: 'Elige formato e idioma',
    intro:
      'Primero elige cómo quieres presentar tu perfil. Después abre directamente la versión en español o en inglés.',
    designedGroup: 'CV VISUAL',
    designedMeta: 'PRESENTACIÓN',
    designedDescription:
      'Una versión cuidada para enviar, compartir o presentar directamente a una persona.',
    atsGroup: 'CV ATS',
    atsMeta: 'TEXTO ESTRUCTURADO',
    atsDescription:
      'Una versión en una sola columna pensada para procesos y plataformas de selección.',
    designedEs: {
      label: 'Español',
      description: 'CV visual en español',
    },
    designedEn: {
      label: 'English',
      description: 'Designed CV in English',
    },
    atsEs: {
      label: 'Español',
      description: 'CV ATS en español',
    },
    atsEn: {
      label: 'English',
      description: 'ATS CV in English',
    },
    optionAria: (format, label) => `Abrir ${format} · ${label}`,
  },
  en: {
    eyebrow: 'CV',
    title: 'Choose format and language',
    intro:
      'Choose how you want to present your profile first, then open the Spanish or English version directly.',
    designedGroup: 'DESIGNED CV',
    designedMeta: 'PRESENTATION',
    designedDescription:
      'A polished version for sharing, attaching or presenting directly to a person.',
    atsGroup: 'ATS CV',
    atsMeta: 'STRUCTURED TEXT',
    atsDescription:
      'A single-column version designed for recruitment processes and application platforms.',
    designedEs: {
      label: 'Spanish',
      description: 'Designed CV in Spanish',
    },
    designedEn: {
      label: 'English',
      description: 'Designed CV in English',
    },
    atsEs: {
      label: 'Spanish',
      description: 'ATS CV in Spanish',
    },
    atsEn: {
      label: 'English',
      description: 'ATS CV in English',
    },
    optionAria: (format, label) => `Open ${format} · ${label}`,
  },
};

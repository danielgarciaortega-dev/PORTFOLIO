import type { Locale } from './locale';

export interface CvCenterOptionCopy {
  label: string;
  description: string;
}

export interface CvCenterCopy {
  eyebrow: string;
  title: string;
  designedGroup: string;
  designedMeta: string;
  atsGroup: string;
  atsMeta: string;
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
    designedGroup: 'CV VISUAL',
    designedMeta: 'PRESENTACIÓN',
    atsGroup: 'CV ATS',
    atsMeta: 'TEXTO ESTRUCTURADO',
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
    designedGroup: 'DESIGNED CV',
    designedMeta: 'PRESENTATION',
    atsGroup: 'ATS CV',
    atsMeta: 'STRUCTURED TEXT',
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

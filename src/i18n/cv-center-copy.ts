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
  atsGroup: string;
  atsMeta: string;
  designedEs: CvCenterOptionCopy;
  designedEn: CvCenterOptionCopy;
  atsEs: CvCenterOptionCopy;
  atsEn: CvCenterOptionCopy;
  optionAria: (label: string) => string;
}

export const cvCenterCopy: Record<Locale, CvCenterCopy> = {
  es: {
    eyebrow: 'CURRÍCULUM',
    title: 'Elige formato e idioma',
    intro:
      'Usa la versión con diseño para compartir tu perfil visualmente o la versión ATS cuando prefieras una lectura más simple y estructurada.',
    designedGroup: 'CON DISEÑO',
    designedMeta: 'PDF · PRESENTACIÓN',
    atsGroup: 'FORMATO ATS',
    atsMeta: 'PDF · TEXTO ESTRUCTURADO',
    designedEs: {
      label: 'Currículum · Español',
      description: 'Para enviar por email, adjuntar o compartir el enlace.',
    },
    designedEn: {
      label: 'Résumé · English',
      description: 'La misma información profesional, presentada en inglés.',
    },
    atsEs: {
      label: 'Currículum ATS · Español',
      description:
        'Una columna, contenido semántico y lectura clara para procesos de selección.',
    },
    atsEn: {
      label: 'ATS résumé · English',
      description:
        'La versión en inglés con la misma estructura simple y legible.',
    },
    optionAria: (label) => 'Abrir ' + label,
  },
  en: {
    eyebrow: 'CV',
    title: 'Choose format and language',
    intro:
      'Use the designed version when presentation matters, or the ATS version when you want a simpler, more structured reading format.',
    designedGroup: 'DESIGNED',
    designedMeta: 'PDF · PRESENTATION',
    atsGroup: 'ATS FORMAT',
    atsMeta: 'PDF · STRUCTURED TEXT',
    designedEs: {
      label: 'Currículum · Español',
      description: 'Spanish designed CV for sharing, attaching or linking.',
    },
    designedEn: {
      label: 'Résumé · English',
      description: 'The same professional information, presented in English.',
    },
    atsEs: {
      label: 'Currículum ATS · Español',
      description:
        'Single-column semantic content with a clear recruitment-oriented reading order.',
    },
    atsEn: {
      label: 'ATS résumé · English',
      description:
        'The English counterpart with the same simple, readable structure.',
    },
    optionAria: (label) => 'Open ' + label,
  },
};

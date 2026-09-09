import type { Locale } from '../i18n/locale';
import { education as enEducation } from './en/education';
import { experience as enExperience } from './en/experience';
import { profile as enProfile } from './en/profile';
import { technologyGroups as enTechnologyGroups } from './en/technologies';
import { education as esEducation } from './es/education';
import { experience as esExperience } from './es/experience';
import { profile as esProfile } from './es/profile';
import { technologyGroups as esTechnologyGroups } from './es/technologies';

const professionalDataByLocale = {
  es: {
    profile: esProfile,
    education: esEducation,
    experience: esExperience,
    technologyGroups: esTechnologyGroups,
  },
  en: {
    profile: enProfile,
    education: enEducation,
    experience: enExperience,
    technologyGroups: enTechnologyGroups,
  },
} as const;

export function getProfessionalData(locale: Locale) {
  return professionalDataByLocale[locale];
}

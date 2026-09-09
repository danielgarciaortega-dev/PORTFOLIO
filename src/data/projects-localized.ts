import type { Locale } from '../i18n/locale';
import { projects as enProjects } from './en/projects';
import { projects as esProjects } from './es/projects';

const projectsByLocale = {
  es: esProjects,
  en: enProjects,
} as const;

export function getProjects(locale: Locale) {
  return projectsByLocale[locale];
}

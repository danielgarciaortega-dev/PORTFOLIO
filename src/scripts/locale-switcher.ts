import { isLocale, persistLocalePreference } from '../i18n/locale';

for (const link of document.querySelectorAll<HTMLElement>('[data-locale-link]')) {
  link.addEventListener('click', () => {
    const locale = link.dataset.localeLink;
    if (!isLocale(locale)) return;

    try {
      persistLocalePreference(window.localStorage, locale);
    } catch {
      // Navigation must still work when storage is unavailable.
    }
  });
}

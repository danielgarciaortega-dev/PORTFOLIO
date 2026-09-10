import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  getLocaleCounterpartPath,
  getLocalizedRoutePath,
  isLocale,
  normalizeBasePath,
  persistLocalePreference,
  readLocalePreference,
  resolveLocaleFromPathname,
  resolvePreferredLocale,
  syncDocumentLocale,
} from '../src/i18n/locale.ts';

test('locale contract supports exactly Spanish and English', () => {
  assert.deepEqual(SUPPORTED_LOCALES, ['es', 'en']);
  assert.equal(DEFAULT_LOCALE, 'es');
  assert.equal(isLocale('es'), true);
  assert.equal(isLocale('en'), true);
  assert.equal(isLocale('fr'), false);
  assert.equal(isLocale(null), false);
});

test('localized home and projects routes have deterministic counterparts', () => {
  assert.equal(getLocalizedRoutePath('es', 'home'), '');
  assert.equal(getLocalizedRoutePath('en', 'home'), 'en/');
  assert.equal(getLocalizedRoutePath('es', 'projects'), 'proyectos/');
  assert.equal(getLocalizedRoutePath('en', 'projects'), 'en/projects/');

  assert.deepEqual(getLocaleCounterpartPath('es', 'home'), {
    targetLocale: 'en',
    path: 'en/',
  });
  assert.deepEqual(getLocaleCounterpartPath('en', 'home'), {
    targetLocale: 'es',
    path: '',
  });
  assert.deepEqual(getLocaleCounterpartPath('es', 'projects'), {
    targetLocale: 'en',
    path: 'en/projects/',
  });
  assert.deepEqual(getLocaleCounterpartPath('en', 'projects'), {
    targetLocale: 'es',
    path: 'proyectos/',
  });
});

test('base-path normalization is stable for root and GitHub Pages', () => {
  assert.equal(normalizeBasePath('/'), '/');
  assert.equal(normalizeBasePath('PORTFOLIO'), '/PORTFOLIO/');
  assert.equal(normalizeBasePath('/PORTFOLIO/'), '/PORTFOLIO/');
});

test('pathname locale resolution respects the GitHub Pages base path', () => {
  assert.equal(resolveLocaleFromPathname('/PORTFOLIO/', '/PORTFOLIO/'), 'es');
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/proyectos/', '/PORTFOLIO/'),
    'es',
  );
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/en/', '/PORTFOLIO/'),
    'en',
  );
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/en/projects/', '/PORTFOLIO/'),
    'en',
  );
  assert.equal(resolveLocaleFromPathname('/en/', '/'), 'en');
  assert.equal(resolveLocaleFromPathname('/english/', '/'), 'es');
});

test('stored locale preferences accept only supported values', () => {
  const values = new Map();
  const storage = {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };

  assert.equal(readLocalePreference(storage), null);
  assert.equal(resolvePreferredLocale(storage), 'es');

  persistLocalePreference(storage, 'en');
  assert.equal(values.get(LOCALE_STORAGE_KEY), 'en');
  assert.equal(readLocalePreference(storage), 'en');
  assert.equal(resolvePreferredLocale(storage), 'en');

  values.set(LOCALE_STORAGE_KEY, 'de');
  assert.equal(readLocalePreference(storage), null);
  assert.equal(resolvePreferredLocale(storage), 'es');
});

test('document language synchronization changes only the lang value', () => {
  const documentRoot = { lang: 'es', marker: 'preserved' };

  syncDocumentLocale(documentRoot, 'en');

  assert.equal(documentRoot.lang, 'en');
  assert.equal(documentRoot.marker, 'preserved');
});

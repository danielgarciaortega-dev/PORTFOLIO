import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  getCvDocumentPath,
  getLocaleCounterpartPath,
  getLocalizedRoutePath,
  getLocalizedRouteUrl,
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

test('localized public routes have deterministic counterparts', () => {
  assert.equal(getLocalizedRoutePath('es', 'home'), '');
  assert.equal(getLocalizedRoutePath('en', 'home'), 'en/');
  assert.equal(getLocalizedRoutePath('es', 'about'), 'sobre-mi/');
  assert.equal(getLocalizedRoutePath('en', 'about'), 'en/about/');
  assert.equal(getLocalizedRoutePath('es', 'projects'), 'proyectos/');
  assert.equal(getLocalizedRoutePath('en', 'projects'), 'en/projects/');
  assert.equal(getLocalizedRoutePath('es', 'cvCenter'), 'cv/opciones/');
  assert.equal(getLocalizedRoutePath('en', 'cvCenter'), 'en/cv/options/');

  assert.deepEqual(getLocaleCounterpartPath('es', 'home'), {
    targetLocale: 'en',
    path: 'en/',
  });
  assert.deepEqual(getLocaleCounterpartPath('en', 'home'), {
    targetLocale: 'es',
    path: '',
  });
  assert.deepEqual(getLocaleCounterpartPath('es', 'about'), {
    targetLocale: 'en',
    path: 'en/about/',
  });
  assert.deepEqual(getLocaleCounterpartPath('en', 'about'), {
    targetLocale: 'es',
    path: 'sobre-mi/',
  });
  assert.deepEqual(getLocaleCounterpartPath('es', 'projects'), {
    targetLocale: 'en',
    path: 'en/projects/',
  });
  assert.deepEqual(getLocaleCounterpartPath('en', 'projects'), {
    targetLocale: 'es',
    path: 'proyectos/',
  });
  assert.deepEqual(getLocaleCounterpartPath('es', 'cvCenter'), {
    targetLocale: 'en',
    path: 'en/cv/options/',
  });
  assert.deepEqual(getLocaleCounterpartPath('en', 'cvCenter'), {
    targetLocale: 'es',
    path: 'cv/opciones/',
  });
});

test('CV route contract keeps designed documents and ATS viewers distinct', () => {
  assert.equal(getCvDocumentPath('es', 'designed'), 'cv/');
  assert.equal(getCvDocumentPath('en', 'designed'), 'en/cv/');
  assert.equal(getCvDocumentPath('es', 'ats'), 'cv/ats/');
  assert.equal(getCvDocumentPath('en', 'ats'), 'en/cv/ats/');
});

test('base-path normalization is stable for root and GitHub Pages', () => {
  assert.equal(normalizeBasePath('/'), '/');
  assert.equal(normalizeBasePath('PORTFOLIO'), '/PORTFOLIO/');
  assert.equal(normalizeBasePath('/PORTFOLIO/'), '/PORTFOLIO/');
});

test('localized absolute route URLs are correct for GitHub Pages and root bases', () => {
  const site = 'https://portfolio.example';

  assert.equal(
    getLocalizedRouteUrl(site, '/PORTFOLIO', 'es', 'home').toString(),
    'https://portfolio.example/PORTFOLIO/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/PORTFOLIO/', 'en', 'home').toString(),
    'https://portfolio.example/PORTFOLIO/en/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/PORTFOLIO', 'es', 'about').toString(),
    'https://portfolio.example/PORTFOLIO/sobre-mi/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/PORTFOLIO/', 'en', 'about').toString(),
    'https://portfolio.example/PORTFOLIO/en/about/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/PORTFOLIO', 'es', 'projects').toString(),
    'https://portfolio.example/PORTFOLIO/proyectos/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/PORTFOLIO/', 'en', 'projects').toString(),
    'https://portfolio.example/PORTFOLIO/en/projects/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/', 'es', 'home').toString(),
    'https://portfolio.example/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/', 'es', 'about').toString(),
    'https://portfolio.example/sobre-mi/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/', 'en', 'about').toString(),
    'https://portfolio.example/en/about/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/', 'en', 'projects').toString(),
    'https://portfolio.example/en/projects/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/PORTFOLIO', 'es', 'cvCenter').toString(),
    'https://portfolio.example/PORTFOLIO/cv/opciones/',
  );
  assert.equal(
    getLocalizedRouteUrl(site, '/PORTFOLIO/', 'en', 'cvCenter').toString(),
    'https://portfolio.example/PORTFOLIO/en/cv/options/',
  );
});

test('pathname locale resolution respects the GitHub Pages base path', () => {
  assert.equal(resolveLocaleFromPathname('/PORTFOLIO/', '/PORTFOLIO/'), 'es');
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/sobre-mi/', '/PORTFOLIO/'),
    'es',
  );
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/proyectos/', '/PORTFOLIO/'),
    'es',
  );
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/en/', '/PORTFOLIO/'),
    'en',
  );
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/en/about/', '/PORTFOLIO/'),
    'en',
  );
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/en/projects/', '/PORTFOLIO/'),
    'en',
  );
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/cv/opciones/', '/PORTFOLIO/'),
    'es',
  );
  assert.equal(
    resolveLocaleFromPathname('/PORTFOLIO/en/cv/options/', '/PORTFOLIO/'),
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

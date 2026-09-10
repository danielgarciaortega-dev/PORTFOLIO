export const SUPPORTED_LOCALES = ['es', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LocalizedRoute = 'home' | 'projects';

export const DEFAULT_LOCALE: Locale = 'es';
export const LOCALE_STORAGE_KEY = 'portfolio.locale';

const LOCALIZED_ROUTE_PATHS = {
  es: {
    home: '',
    projects: 'proyectos/',
  },
  en: {
    home: 'en/',
    projects: 'en/projects/',
  },
} as const satisfies Record<Locale, Record<LocalizedRoute, string>>;

type StorageReader = Pick<Storage, 'getItem'>;
type StorageWriter = Pick<Storage, 'setItem'>;
type DocumentRoot = Pick<HTMLElement, 'lang'>;

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function getLocalizedRoutePath(
  locale: Locale,
  route: LocalizedRoute,
): string {
  return LOCALIZED_ROUTE_PATHS[locale][route];
}

export function getLocaleCounterpartPath(
  locale: Locale,
  route: LocalizedRoute,
): { targetLocale: Locale; path: string } {
  const targetLocale: Locale = locale === 'es' ? 'en' : 'es';
  return {
    targetLocale,
    path: getLocalizedRoutePath(targetLocale, route),
  };
}

export function normalizeBasePath(basePath: string): string {
  const cleanBase = `/${basePath}`.replace(/\/+/g, '/').replace(/\/+$/, '');
  return cleanBase === '' ? '/' : `${cleanBase}/`;
}

export function getLocalizedRouteUrl(
  site: string | URL,
  basePath: string,
  locale: Locale,
  route: LocalizedRoute,
): URL {
  const normalizedBase = normalizeBasePath(basePath);
  const routePath = getLocalizedRoutePath(locale, route);
  return new URL(`${normalizedBase}${routePath}`, site);
}

export function resolveLocaleFromPathname(
  pathname: string,
  basePath = '/',
): Locale {
  const pathOnly = pathname.split(/[?#]/, 1)[0] ?? '/';
  const normalizedPath = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  const normalizedBase = normalizeBasePath(basePath);

  let relativePath = normalizedPath;
  const baseWithoutTrailingSlash = normalizedBase.slice(0, -1);

  if (normalizedBase !== '/') {
    if (normalizedPath === baseWithoutTrailingSlash) {
      relativePath = '/';
    } else if (normalizedPath.startsWith(normalizedBase)) {
      relativePath = `/${normalizedPath.slice(normalizedBase.length)}`;
    }
  }

  const firstSegment = relativePath.split('/').filter(Boolean)[0];
  return firstSegment === 'en' ? 'en' : DEFAULT_LOCALE;
}

export function readLocalePreference(storage: StorageReader): Locale | null {
  const storedLocale = storage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(storedLocale) ? storedLocale : null;
}

export function resolvePreferredLocale(storage: StorageReader): Locale {
  return readLocalePreference(storage) ?? DEFAULT_LOCALE;
}

export function persistLocalePreference(
  storage: StorageWriter,
  locale: Locale,
): void {
  storage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function syncDocumentLocale(
  documentRoot: DocumentRoot,
  locale: Locale,
): void {
  documentRoot.lang = locale;
}

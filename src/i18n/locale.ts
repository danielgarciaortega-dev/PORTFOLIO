export const SUPPORTED_LOCALES = ['es', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';
export const LOCALE_STORAGE_KEY = 'portfolio.locale';

type StorageReader = Pick<Storage, 'getItem'>;
type StorageWriter = Pick<Storage, 'setItem'>;
type DocumentRoot = Pick<HTMLElement, 'lang'>;

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function normalizeBasePath(basePath: string): string {
  const cleanBase = `/${basePath}`.replace(/\/+/g, '/').replace(/\/+$/, '');
  return cleanBase === '' ? '/' : `${cleanBase}/`;
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

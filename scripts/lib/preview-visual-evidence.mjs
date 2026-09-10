// @ts-check

export const PREVIEW_VISUAL_VIEWPORTS = Object.freeze([
  Object.freeze({ name: '390x844', width: 390, height: 844 }),
  Object.freeze({ name: '768x1024', width: 768, height: 1024 }),
  Object.freeze({ name: '1440x900', width: 1440, height: 900 }),
  Object.freeze({ name: '1920x1080', width: 1920, height: 1080 }),
]);

export const PREVIEW_VISUAL_SURFACES = Object.freeze([
  Object.freeze({
    captureName: 'es-home',
    state: 'home',
    locale: 'es',
    path: '/',
    menuButtonName: 'Abrir menú',
    menuCaptureName: 'es-menu',
  }),
  Object.freeze({
    captureName: 'en-home',
    state: 'home',
    locale: 'en',
    path: '/en/',
    menuButtonName: 'Open menu',
    menuCaptureName: 'en-menu',
  }),
  Object.freeze({
    captureName: 'es-projects',
    state: 'projects',
    locale: 'es',
    path: '/proyectos/',
  }),
]);

/**
 * @param {string | URL} value
 */
export function parseValidatedPreviewUrl(value) {
  let url;
  try {
    url = value instanceof URL ? new URL(value.href) : new URL(value);
  } catch {
    throw new Error('PREVIEW_URL must be a valid absolute URL.');
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname === 'vercel.app' ||
    !url.hostname.endsWith('.vercel.app')
  ) {
    throw new Error(
      'PREVIEW_URL must be an HTTPS *.vercel.app deployment URL.',
    );
  }

  if (url.username || url.password) {
    throw new Error('PREVIEW_URL must not contain embedded credentials.');
  }

  url.hash = '';
  return url;
}

/**
 * @param {string | URL} requestUrl
 * @param {string | URL} previewUrl
 */
export function isExactPreviewHostRequest(requestUrl, previewUrl) {
  let request;
  let preview;
  try {
    request = requestUrl instanceof URL ? requestUrl : new URL(requestUrl);
    preview = parseValidatedPreviewUrl(previewUrl);
  } catch {
    return false;
  }

  return request.protocol === 'https:' && request.origin === preview.origin;
}

/**
 * Return request headers for browser interception while ensuring the Vercel
 * protection secret is attached only to the exact validated Preview origin.
 *
 * @param {string | URL} requestUrl
 * @param {string | URL} previewUrl
 * @param {Record<string, string>} existingHeaders
 * @param {string} protectionBypassSecret
 */
export function buildPreviewRequestHeaders(
  requestUrl,
  previewUrl,
  existingHeaders,
  protectionBypassSecret,
) {
  const headers = { ...existingHeaders };
  if (!isExactPreviewHostRequest(requestUrl, previewUrl)) return headers;

  const secret = protectionBypassSecret.trim();
  if (!secret) {
    throw new Error('VERCEL_AUTOMATION_BYPASS_SECRET must not be empty.');
  }

  headers['x-vercel-protection-bypass'] = secret;
  return headers;
}

/**
 * @param {string} headSha
 */
export function validateHeadSha(headSha) {
  const normalized = headSha.trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(normalized)) {
    throw new Error(
      'EXPECTED_HEAD_SHA must be a full 40-character commit SHA.',
    );
  }
  return normalized;
}

/**
 * @param {{ headSha: string, previewUrl: string | URL, captures: Array<object> }} input
 */
export function createVisualEvidenceManifest({
  headSha,
  previewUrl,
  captures,
}) {
  return {
    schemaVersion: 1,
    headSha: validateHeadSha(headSha),
    previewUrl: parseValidatedPreviewUrl(previewUrl).href,
    viewports: PREVIEW_VISUAL_VIEWPORTS.map(({ name, width, height }) => ({
      name,
      width,
      height,
    })),
    captures,
  };
}

// @ts-check

/**
 * @param {RequestInfo | URL} input
 */
function isVercelPreviewRequest(input) {
  const value =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname !== 'vercel.app' &&
      url.hostname.endsWith('.vercel.app')
    );
  } catch {
    return false;
  }
}

/**
 * Build a fetch implementation for Vercel Preview smoke requests.
 * The bypass secret is injected only into HTTPS *.vercel.app requests;
 * GitHub API evidence loading continues to use the normal fetch path.
 *
 * @param {typeof fetch} fetchImpl
 * @param {string | undefined} protectionBypassSecret
 * @returns {typeof fetch}
 */
export function createVercelPreviewFetch(fetchImpl, protectionBypassSecret) {
  const secret = protectionBypassSecret?.trim();
  if (!secret) return fetchImpl;

  return (input, init = {}) => {
    if (!isVercelPreviewRequest(input)) {
      return fetchImpl(input, init);
    }

    const headers = new Headers(init.headers);
    headers.set('x-vercel-protection-bypass', secret);

    return fetchImpl(input, {
      ...init,
      headers,
    });
  };
}

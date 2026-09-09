// @ts-check

/**
 * Build a fetch implementation for Vercel Preview smoke requests.
 * The bypass secret is injected only into these Preview HTTP requests;
 * GitHub API evidence loading continues to use the normal fetch path.
 *
 * @param {typeof fetch} fetchImpl
 * @param {string | undefined} protectionBypassSecret
 * @returns {typeof fetch}
 */
export function createVercelPreviewFetch(
  fetchImpl,
  protectionBypassSecret,
) {
  const secret = protectionBypassSecret?.trim();
  if (!secret) return fetchImpl;

  return (input, init = {}) => {
    const headers = new Headers(init.headers);
    headers.set('x-vercel-protection-bypass', secret);

    return fetchImpl(input, {
      ...init,
      headers,
    });
  };
}

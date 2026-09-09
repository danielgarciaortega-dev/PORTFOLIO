// @ts-check

/** @param {string | undefined} value */
export function normalizeBase(value) {
  if (!value || value === '/') return '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

/**
 * Resolve the public origin and base path for local development, GitHub Pages,
 * or a native Vercel deployment without committing provider-specific URLs.
 * Explicit SITE_URL / BASE_PATH values always win.
 *
 * @param {Record<string, string | undefined>} env
 */
export function resolveHostingConfig(env) {
  const [owner, repository] = (env.GITHUB_REPOSITORY ?? '').split('/');
  const userSiteRepository = Boolean(
    owner && repository?.toLowerCase() === `${owner.toLowerCase()}.github.io`,
  );
  const isVercel = env.VERCEL === '1';
  const explicitSite = env.SITE_URL;
  const explicitBase = env.BASE_PATH;
  const vercelSite = env.VERCEL_URL
    ? `https://${env.VERCEL_URL.replace(/^https?:\/\//, '')}`
    : undefined;

  if (isVercel && !explicitSite && !vercelSite) {
    throw new Error(
      'VERCEL_URL is required when VERCEL=1 and SITE_URL is not explicitly set.',
    );
  }

  const inferredSite = isVercel
    ? vercelSite
    : owner
      ? `https://${owner}.github.io`
      : undefined;
  const inferredBase = isVercel
    ? '/'
    : repository && !userSiteRepository
      ? `/${repository}`
      : '/';

  return {
    site: explicitSite || inferredSite || 'http://localhost:4321',
    base: normalizeBase(explicitBase || inferredBase),
  };
}

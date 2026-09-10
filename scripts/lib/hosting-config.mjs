// @ts-check

/** @param {string | undefined} value */
export function normalizeBase(value) {
  if (!value || value === '/') return '/';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

/**
 * Resolve the public origin and base path for local development or GitHub
 * Pages. Explicit SITE_URL / BASE_PATH values always win so deterministic
 * local and test builds can opt into a different origin/base deliberately.
 *
 * @param {Record<string, string | undefined>} env
 */
export function resolveHostingConfig(env) {
  const [owner, repository] = (env.GITHUB_REPOSITORY ?? '').split('/');
  const userSiteRepository = Boolean(
    owner && repository?.toLowerCase() === `${owner.toLowerCase()}.github.io`,
  );
  const inferredSite = owner ? `https://${owner}.github.io` : undefined;
  const inferredBase =
    repository && !userSiteRepository ? `/${repository}` : '/';

  return {
    site: env.SITE_URL || inferredSite || 'http://localhost:4321',
    base: normalizeBase(env.BASE_PATH || inferredBase),
  };
}

// @ts-check
import { existsSync } from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { resolveHostingConfig } from './scripts/lib/hosting-config.mjs';

// Astro's dev server does not fall back to `public/<dir>/index.html` for a
// directory-style request (only the exact `/<dir>/index.html` URL works);
// only the production static build resolves `/cv/` correctly. This plugin
// closes that dev-only gap by rewriting a trailing-slash request to its
// `index.html` before Astro's router sees it, whenever that file exists in
// `public/`. It only runs `configureServer` (dev/preview), so it has no
// effect on `astro build` output and cannot reintroduce the routing
// collision that a competing `src/pages/cv` route caused.
function publicDirectoryIndexFallback() {
  return {
    name: 'public-directory-index-fallback',
    enforce: 'pre',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      /** @type {import('vite').Connect.NextHandleFunction} */
      const rewriteToIndexHtml = (req, _res, next) => {
        if (req.url && req.url !== '/' && req.url.endsWith('/')) {
          const candidate = path.join(
            'public',
            decodeURIComponent(req.url),
            'index.html',
          );
          if (existsSync(candidate)) req.url += 'index.html';
        }
        next();
      };
      server.middlewares.use(rewriteToIndexHtml);
    },
  };
}

const hosting = resolveHostingConfig(process.env);

export default defineConfig({
  site: hosting.site,
  base: hosting.base,
  output: 'static',
  trailingSlash: 'always',
  prefetch: true,
  vite: {
    plugins: [tailwindcss(), publicDirectoryIndexFallback()],
  },
});

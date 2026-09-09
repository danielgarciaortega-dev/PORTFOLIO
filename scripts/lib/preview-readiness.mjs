// @ts-check

import {
  PreviewEvidenceError,
  resolveVercelPreviewEvidence,
} from './vercel-preview-evidence.mjs';

export const DEFAULT_HTML_ROUTES = ['/', '/en/', '/proyectos/', '/cv/'];
export const DEFAULT_ASSET_PATH = '/cv/500x500.jpg';
export const DEFAULT_MISSING_PATH = '/__preview-readiness-missing__';
export const DEFAULT_BASE_LEAK_PATH = '/PORTFOLIO/';

export class PreviewReadinessError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {{ cause?: unknown }} [options]
   */
  constructor(code, message, options = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = 'PreviewReadinessError';
    this.code = code;
  }
}

/** @param {number} milliseconds */
export function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * @param {Response | { status: number, headers?: { get?: (name: string) => string | null }, text?: () => Promise<string>, url?: string }} response
 */
function isRedirect(response) {
  return [301, 302, 303, 307, 308].includes(response.status);
}

/** @param {string} hostname */
function isVercelControlHostname(hostname) {
  return hostname === 'vercel.com' || hostname.endsWith('.vercel.com');
}

/**
 * @param {typeof fetch} fetchImpl
 * @param {string} url
 * @param {{ maxRedirects?: number }} [options]
 */
export async function fetchPreviewResource(fetchImpl, url, options = {}) {
  const maxRedirects = options.maxRedirects ?? 5;
  const originalHostname = new URL(url).hostname;
  let currentUrl = url;

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await fetchImpl(currentUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'PORTFOLIO-preview-readiness',
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new PreviewReadinessError(
        'PREVIEW_PROTECTED',
        `Preview access is protected (HTTP ${response.status}) for ${currentUrl}. Configure an approved automation bypass before requiring this gate.`,
      );
    }

    if (!isRedirect(response)) return response;

    const location = response.headers?.get?.('location');
    if (!location) {
      throw new PreviewReadinessError(
        'PREVIEW_REDIRECT_INVALID',
        `Preview returned HTTP ${response.status} without a Location header for ${currentUrl}.`,
      );
    }

    const nextUrl = new URL(location, currentUrl);
    if (nextUrl.hostname !== originalHostname) {
      if (isVercelControlHostname(nextUrl.hostname)) {
        throw new PreviewReadinessError(
          'PREVIEW_PROTECTED',
          `Preview redirected to Vercel authentication/control infrastructure (${nextUrl.hostname}). Configure an approved automation bypass before requiring this gate.`,
        );
      }

      throw new PreviewReadinessError(
        'PREVIEW_REDIRECT_INVALID',
        `Preview redirected outside its deployment host: ${nextUrl.hostname}.`,
      );
    }

    currentUrl = nextUrl.toString();
  }

  throw new PreviewReadinessError(
    'PREVIEW_REDIRECT_LIMIT',
    `Preview exceeded ${maxRedirects} redirects for ${url}.`,
  );
}

/**
 * @param {Response | { status: number, headers?: { get?: (name: string) => string | null }, text?: () => Promise<string> }} response
 * @param {string} path
 */
async function assertHtmlResponse(response, path) {
  if (response.status < 200 || response.status >= 300) {
    throw new PreviewReadinessError(
      'PREVIEW_ROUTE_FAILED',
      `Preview route ${path} returned HTTP ${response.status}; expected 2xx.`,
    );
  }

  const contentType = response.headers?.get?.('content-type') ?? '';
  if (!contentType.toLowerCase().includes('text/html')) {
    throw new PreviewReadinessError(
      'PREVIEW_CONTENT_TYPE_INVALID',
      `Preview route ${path} returned ${contentType || '<missing content-type>'}; expected HTML.`,
    );
  }

  const body = (await response.text?.()) ?? '';
  if (/(?:href|src)=["']\/PORTFOLIO(?:\/|["'])/i.test(body)) {
    throw new PreviewReadinessError(
      'PREVIEW_BASE_PATH_LEAK',
      `Preview route ${path} contains a GitHub Pages /PORTFOLIO/ path in local navigation/assets.`,
    );
  }
}

/**
 * @param {Response | { status: number, headers?: { get?: (name: string) => string | null } }} response
 * @param {string} path
 */
function assertImageResponse(response, path) {
  if (response.status < 200 || response.status >= 300) {
    throw new PreviewReadinessError(
      'PREVIEW_ASSET_FAILED',
      `Preview asset ${path} returned HTTP ${response.status}; expected 2xx.`,
    );
  }

  const contentType = response.headers?.get?.('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new PreviewReadinessError(
      'PREVIEW_ASSET_CONTENT_TYPE_INVALID',
      `Preview asset ${path} returned ${contentType || '<missing content-type>'}; expected an image content type.`,
    );
  }
}

/**
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   previewUrl: string,
 *   htmlRoutes?: string[],
 *   assetPath?: string,
 *   missingPath?: string,
 *   baseLeakPath?: string,
 * }} input
 */
export async function smokePreview(input) {
  const fetchImpl = input.fetchImpl ?? fetch;
  const previewOrigin = new URL(input.previewUrl);
  const htmlRoutes = input.htmlRoutes ?? DEFAULT_HTML_ROUTES;
  const assetPath = input.assetPath ?? DEFAULT_ASSET_PATH;
  const missingPath = input.missingPath ?? DEFAULT_MISSING_PATH;
  const baseLeakPath = input.baseLeakPath ?? DEFAULT_BASE_LEAK_PATH;
  const checkedPaths = [];

  for (const path of htmlRoutes) {
    const response = await fetchPreviewResource(
      fetchImpl,
      new URL(path, previewOrigin).toString(),
    );
    await assertHtmlResponse(response, path);
    checkedPaths.push(path);
  }

  const assetResponse = await fetchPreviewResource(
    fetchImpl,
    new URL(assetPath, previewOrigin).toString(),
  );
  assertImageResponse(assetResponse, assetPath);
  checkedPaths.push(assetPath);

  for (const path of [missingPath, baseLeakPath]) {
    const response = await fetchPreviewResource(
      fetchImpl,
      new URL(path, previewOrigin).toString(),
    );
    if (response.status !== 404) {
      const code =
        path === baseLeakPath
          ? 'PREVIEW_BASE_PATH_LEAK'
          : 'PREVIEW_FALLBACK_MASKING';
      throw new PreviewReadinessError(
        code,
        `Preview path ${path} returned HTTP ${response.status}; expected a real 404.`,
      );
    }
    checkedPaths.push(path);
  }

  return { checkedPaths };
}

/**
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   repository: string,
 *   prNumber: string | number,
 *   expectedHeadSha: string,
 *   token: string,
 *   apiBaseUrl?: string,
 * }} input
 */
export async function loadGitHubPreviewEvidence(input) {
  const fetchImpl = input.fetchImpl ?? fetch;
  const apiBaseUrl = input.apiBaseUrl ?? 'https://api.github.com';
  const repository = input.repository;
  const prNumber = input.prNumber == null ? '' : String(input.prNumber);
  const expectedHeadSha = input.expectedHeadSha;

  if (!repository || !prNumber || !expectedHeadSha || !input.token) {
    throw new PreviewReadinessError(
      'PREVIEW_CONFIGURATION_INVALID',
      'Repository, PR number, expected head SHA and GitHub token are required.',
    );
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${input.token}`,
    'User-Agent': 'PORTFOLIO-preview-readiness',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  /** @param {string} path */
  async function getJson(path) {
    const response = await fetchImpl(`${apiBaseUrl}${path}`, { headers });
    if (response.status < 200 || response.status >= 300) {
      throw new PreviewReadinessError(
        'GITHUB_API_FAILED',
        `GitHub API request ${path} returned HTTP ${response.status}. Check workflow read permissions.`,
      );
    }
    return response.json();
  }

  const encodedRepository = repository
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  const [pullRequest, combinedStatus, comments] = await Promise.all([
    getJson(`/repos/${encodedRepository}/pulls/${encodeURIComponent(prNumber)}`),
    getJson(
      `/repos/${encodedRepository}/commits/${encodeURIComponent(expectedHeadSha)}/status`,
    ),
    getJson(
      `/repos/${encodedRepository}/issues/${encodeURIComponent(prNumber)}/comments?per_page=100`,
    ),
  ]);

  return {
    expectedHeadSha,
    liveHeadSha: pullRequest?.head?.sha ?? '',
    statuses: Array.isArray(combinedStatus?.statuses)
      ? combinedStatus.statuses
      : [],
    comments: Array.isArray(comments) ? comments : [],
  };
}

/**
 * @param {{
 *   loadEvidence: () => Promise<Parameters<typeof resolveVercelPreviewEvidence>[0]>,
 *   expectedHeadSha: string,
 *   timeoutMs?: number,
 *   pollIntervalMs?: number,
 *   now?: () => number,
 *   sleepFn?: (milliseconds: number) => Promise<void>,
 *   onRetry?: (error: PreviewEvidenceError) => void,
 * }} input
 */
export async function waitForPreviewEvidence(input) {
  const timeoutMs = input.timeoutMs ?? 600_000;
  const pollIntervalMs = input.pollIntervalMs ?? 5_000;
  const now = input.now ?? Date.now;
  const sleepFn = input.sleepFn ?? sleep;
  const deadline = now() + timeoutMs;

  if (timeoutMs <= 0 || pollIntervalMs <= 0) {
    throw new PreviewReadinessError(
      'PREVIEW_CONFIGURATION_INVALID',
      'Preview wait timeout and poll interval must both be greater than zero.',
    );
  }

  while (true) {
    const evidenceInput = await input.loadEvidence();

    try {
      return resolveVercelPreviewEvidence({
        ...evidenceInput,
        expectedHeadSha: input.expectedHeadSha,
      });
    } catch (error) {
      if (!(error instanceof PreviewEvidenceError) || !error.retryable) {
        throw error;
      }

      input.onRetry?.(error);
      const remaining = deadline - now();
      if (remaining <= 0) {
        throw new PreviewReadinessError(
          'VERCEL_EVIDENCE_TIMEOUT',
          `Timed out waiting for exact-head Vercel evidence after ${timeoutMs} ms. Last state: ${error.code}.`,
          { cause: error },
        );
      }

      await sleepFn(Math.min(pollIntervalMs, remaining));
    }
  }
}

/**
 * @param {{
 *   loadEvidence: () => Promise<Parameters<typeof resolveVercelPreviewEvidence>[0]>,
 *   expectedHeadSha: string,
 *   fetchImpl?: typeof fetch,
 *   timeoutMs?: number,
 *   pollIntervalMs?: number,
 *   now?: () => number,
 *   sleepFn?: (milliseconds: number) => Promise<void>,
 *   onRetry?: (error: PreviewEvidenceError) => void,
 * }} input
 */
export async function runPreviewReadiness(input) {
  const evidence = await waitForPreviewEvidence(input);
  const smoke = await smokePreview({
    fetchImpl: input.fetchImpl,
    previewUrl: evidence.previewUrl,
  });
  const finalInput = await input.loadEvidence();
  const finalEvidence = resolveVercelPreviewEvidence({
    ...finalInput,
    expectedHeadSha: input.expectedHeadSha,
  });

  if (
    finalEvidence.inspectorUrl !== evidence.inspectorUrl ||
    finalEvidence.previewUrl !== evidence.previewUrl
  ) {
    throw new PreviewReadinessError(
      'VERCEL_EVIDENCE_CHANGED',
      'Vercel deployment evidence changed while smoke validation was running. Retry on the current PR head.',
    );
  }

  return { evidence: finalEvidence, smoke };
}

// @ts-check

export class PreviewEvidenceError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {{ retryable?: boolean }} [options]
   */
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'PreviewEvidenceError';
    this.code = code;
    this.retryable = options.retryable ?? false;
  }
}

/** @param {unknown} value */
function parseHttpsUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

/** @param {string} value */
function normalizeUrl(value) {
  const url = parseHttpsUrl(value);
  if (!url) return null;
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
  return url.toString();
}

/** @param {string} value */
export function isVercelInspectorUrl(value) {
  const url = parseHttpsUrl(value);
  if (
    !url ||
    url.hostname !== 'vercel.com' ||
    url.search ||
    url.hash
  ) {
    return false;
  }

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length !== 3) return false;

  const [scope, project, deploymentId] = segments;
  const reservedTopLevel = new Set([
    'api',
    'dashboard',
    'docs',
    'github',
    'new',
    'static',
  ]);

  return Boolean(
    scope &&
      project &&
      !reservedTopLevel.has(scope.toLowerCase()) &&
      /^[A-Za-z0-9]{20,64}$/.test(deploymentId),
  );
}

/** @param {string} value */
export function isVercelPreviewUrl(value) {
  const url = parseHttpsUrl(value);
  return Boolean(
    url &&
      !url.search &&
      !url.hash &&
      url.hostname !== 'vercel.app' &&
      url.hostname.endsWith('.vercel.app'),
  );
}

/** @param {string} body */
export function extractVercelUrls(body) {
  const rawUrls = body.match(/https:\/\/[^\s<>"')]+/g) ?? [];

  return {
    inspectorUrls: [
      ...new Set(
        rawUrls
          .filter(isVercelInspectorUrl)
          .map(normalizeUrl)
          .filter(Boolean),
      ),
    ],
    previewUrls: [
      ...new Set(
        rawUrls
          .filter(isVercelPreviewUrl)
          .map(normalizeUrl)
          .filter(Boolean),
      ),
    ],
  };
}

/**
 * @typedef {{
 *   context?: string,
 *   state?: string,
 *   target_url?: string,
 *   targetUrl?: string,
 * }} CommitStatus
 *
 * @typedef {{
 *   id?: number | string,
 *   body?: string,
 *   updated_at?: string,
 *   updatedAt?: string,
 *   user?: { login?: string, type?: string },
 * }} PullRequestComment
 *
 * @typedef {{
 *   expectedHeadSha: string,
 *   liveHeadSha: string,
 *   statuses: CommitStatus[],
 *   comments: PullRequestComment[],
 * }} ResolvePreviewEvidenceInput
 */

/** @param {ResolvePreviewEvidenceInput} input */
export function resolveVercelPreviewEvidence(input) {
  const { expectedHeadSha, liveHeadSha, statuses, comments } = input;

  if (!expectedHeadSha || liveHeadSha !== expectedHeadSha) {
    throw new PreviewEvidenceError(
      'STALE_HEAD',
      `Pull request head changed: expected ${expectedHeadSha || '<missing>'}, got ${liveHeadSha || '<missing>'}.`,
    );
  }

  const vercelStatuses = statuses.filter(
    (status) => status.context === 'Vercel',
  );

  if (vercelStatuses.length === 0) {
    throw new PreviewEvidenceError(
      'VERCEL_STATUS_MISSING',
      `No Vercel commit status exists for current head ${expectedHeadSha}.`,
      { retryable: true },
    );
  }

  const uniqueStatuses = new Map();
  for (const status of vercelStatuses) {
    const target = status.target_url ?? status.targetUrl ?? '';
    uniqueStatuses.set(`${status.state ?? ''}|${target}`, status);
  }

  if (uniqueStatuses.size !== 1) {
    throw new PreviewEvidenceError(
      'VERCEL_STATUS_AMBIGUOUS',
      `Multiple conflicting Vercel statuses exist for current head ${expectedHeadSha}.`,
    );
  }

  const [status] = uniqueStatuses.values();
  const state = status.state ?? '';

  if (state === 'pending') {
    throw new PreviewEvidenceError(
      'VERCEL_STATUS_PENDING',
      `Vercel deployment is still pending for current head ${expectedHeadSha}.`,
      { retryable: true },
    );
  }

  if (state !== 'success') {
    throw new PreviewEvidenceError(
      'VERCEL_STATUS_FAILED',
      `Vercel deployment is in terminal state ${state || '<missing>'} for current head ${expectedHeadSha}.`,
    );
  }

  const rawInspectorUrl = status.target_url ?? status.targetUrl ?? '';
  if (!isVercelInspectorUrl(rawInspectorUrl)) {
    throw new PreviewEvidenceError(
      'VERCEL_INSPECTOR_INVALID',
      'Successful Vercel status does not contain a valid HTTPS Vercel inspector deployment URL.',
    );
  }
  const inspectorUrl = normalizeUrl(rawInspectorUrl);

  const officialComments = comments.filter(
    (comment) =>
      comment.user?.login === 'vercel[bot]' && comment.user?.type === 'Bot',
  );

  if (officialComments.length === 0) {
    throw new PreviewEvidenceError(
      'VERCEL_COMMENT_MISSING',
      'No official vercel[bot] pull-request comment is available yet.',
      { retryable: true },
    );
  }

  const matchingEvidence = [];
  for (const comment of officialComments) {
    const urls = extractVercelUrls(comment.body ?? '');
    if (!inspectorUrl || !urls.inspectorUrls.includes(inspectorUrl)) continue;

    if (urls.previewUrls.length !== 1) {
      throw new PreviewEvidenceError(
        'VERCEL_PREVIEW_AMBIGUOUS',
        'The matching official Vercel comment does not contain exactly one valid Preview URL.',
      );
    }

    matchingEvidence.push({ comment, previewUrl: urls.previewUrls[0] });
  }

  if (matchingEvidence.length === 0) {
    throw new PreviewEvidenceError(
      'VERCEL_COMMENT_NOT_READY',
      'Official Vercel comment does not yet reference the successful inspector deployment for the current head.',
      { retryable: true },
    );
  }

  if (matchingEvidence.length !== 1) {
    throw new PreviewEvidenceError(
      'VERCEL_COMMENT_AMBIGUOUS',
      'Multiple official Vercel comments reference the current inspector deployment.',
    );
  }

  const [{ comment, previewUrl }] = matchingEvidence;

  return {
    headSha: expectedHeadSha,
    statusState: state,
    inspectorUrl,
    previewUrl,
    commentId: comment.id ?? null,
    commentUpdatedAt: comment.updated_at ?? comment.updatedAt ?? null,
  };
}

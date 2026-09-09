// @ts-check

export const REPOSITORY_ONLY_PREVIEW_EXACT_PATHS = new Set([
  'scripts/capture-preview-visual-evidence.mjs',
]);

export const MAX_GITHUB_PR_FILES = 3_000;
export const GITHUB_PR_FILES_PAGE_SIZE = 100;

export class PreviewRequirementError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {{ cause?: unknown }} [options]
   */
  constructor(code, message, options = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = 'PreviewRequirementError';
    this.code = code;
  }
}

/** @param {unknown} value */
function isSafeRepositoryPath(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (value.startsWith('/') || value.includes('\\') || value.includes('\0')) {
    return false;
  }

  const segments = value.split('/');
  return segments.every(
    (segment) => segment.length > 0 && segment !== '.' && segment !== '..',
  );
}

/** @param {string} path */
export function isRepositoryOnlyPreviewPath(path) {
  if (!isSafeRepositoryPath(path)) return false;
  return (
    (path.startsWith('tests/') && path.length > 'tests/'.length) ||
    REPOSITORY_ONLY_PREVIEW_EXACT_PATHS.has(path)
  );
}

/** @param {unknown} body */
export function isVisualPullRequest(body) {
  return (
    typeof body === 'string' && /(?:^|\n)\s*-\s*\[x\]\s*Visual\b/im.test(body)
  );
}

/**
 * @param {{ changedPaths: string[], isVisual?: boolean }} input
 */
export function classifyPreviewRequirement(input) {
  const changedPaths = input.changedPaths;
  if (!Array.isArray(changedPaths) || changedPaths.length === 0) {
    throw new PreviewRequirementError(
      'PREVIEW_REQUIREMENT_INVALID',
      'At least one changed repository path is required for Preview classification.',
    );
  }

  const normalized = [];
  const seen = new Set();
  for (const path of changedPaths) {
    if (!isSafeRepositoryPath(path)) {
      return {
        previewRequired: true,
        reason: 'unsafe-or-unknown-path',
        changedPaths: [...changedPaths],
      };
    }
    if (!seen.has(path)) {
      seen.add(path);
      normalized.push(path);
    }
  }

  if (input.isVisual) {
    return {
      previewRequired: true,
      reason: 'visual-pr',
      changedPaths: normalized,
    };
  }

  const requiresPreview = normalized.some(
    (path) => !isRepositoryOnlyPreviewPath(path),
  );

  return {
    previewRequired: requiresPreview,
    reason: requiresPreview ? 'deployable-or-unknown-path' : 'repository-only',
    changedPaths: normalized,
  };
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
export async function loadGitHubPreviewRequirement(input) {
  const fetchImpl = input.fetchImpl ?? fetch;
  const apiBaseUrl = input.apiBaseUrl ?? 'https://api.github.com';
  const repository = input.repository;
  const prNumber = input.prNumber == null ? '' : String(input.prNumber);
  const expectedHeadSha = input.expectedHeadSha;

  if (!repository || !prNumber || !expectedHeadSha || !input.token) {
    throw new PreviewRequirementError(
      'PREVIEW_REQUIREMENT_CONFIGURATION_INVALID',
      'Repository, PR number, expected head SHA and GitHub token are required.',
    );
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${input.token}`,
    'User-Agent': 'PORTFOLIO-preview-requirement',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  /** @param {string} path */
  async function getJson(path) {
    const response = await fetchImpl(`${apiBaseUrl}${path}`, { headers });
    if (response.status < 200 || response.status >= 300) {
      throw new PreviewRequirementError(
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
  const encodedPrNumber = encodeURIComponent(prNumber);
  const pullRequest = await getJson(
    `/repos/${encodedRepository}/pulls/${encodedPrNumber}`,
  );
  const liveHeadSha = pullRequest?.head?.sha ?? '';

  if (liveHeadSha !== expectedHeadSha) {
    throw new PreviewRequirementError(
      'STALE_HEAD',
      `Live pull-request head ${liveHeadSha || '<missing>'} does not match expected head ${expectedHeadSha}.`,
    );
  }

  const changedFileCount = pullRequest?.changed_files;
  if (
    !Number.isInteger(changedFileCount) ||
    changedFileCount <= 0 ||
    changedFileCount > MAX_GITHUB_PR_FILES
  ) {
    throw new PreviewRequirementError(
      'GITHUB_FILES_INVALID',
      `GitHub reported an invalid changed-file count (${String(changedFileCount)}).`,
    );
  }

  const changedPaths = [];
  const seenFileEntries = new Set();
  let fileEntries = 0;

  for (
    let page = 1;
    fileEntries < changedFileCount &&
    page <= Math.ceil(MAX_GITHUB_PR_FILES / GITHUB_PR_FILES_PAGE_SIZE);
    page += 1
  ) {
    const files = await getJson(
      `/repos/${encodedRepository}/pulls/${encodedPrNumber}/files?per_page=${GITHUB_PR_FILES_PAGE_SIZE}&page=${page}`,
    );

    if (!Array.isArray(files) || files.length === 0) {
      throw new PreviewRequirementError(
        'GITHUB_FILES_INCOMPLETE',
        `GitHub changed-file pagination ended after ${fileEntries} of ${changedFileCount} file entries.`,
      );
    }

    if (files.length > GITHUB_PR_FILES_PAGE_SIZE) {
      throw new PreviewRequirementError(
        'GITHUB_FILES_INVALID',
        `GitHub returned ${files.length} file entries on one page; maximum expected is ${GITHUB_PR_FILES_PAGE_SIZE}.`,
      );
    }

    for (const file of files) {
      const filename = file?.filename;
      if (!isSafeRepositoryPath(filename)) {
        throw new PreviewRequirementError(
          'GITHUB_FILES_INVALID',
          'GitHub returned a changed file without a safe repository filename.',
        );
      }

      if (seenFileEntries.has(filename)) {
        throw new PreviewRequirementError(
          'GITHUB_FILES_INVALID',
          `GitHub returned duplicate changed-file entry ${filename}.`,
        );
      }
      seenFileEntries.add(filename);
      changedPaths.push(filename);

      if (file?.status === 'renamed') {
        if (!isSafeRepositoryPath(file?.previous_filename)) {
          throw new PreviewRequirementError(
            'GITHUB_FILES_INVALID',
            `GitHub reported renamed path ${filename} without a safe previous_filename.`,
          );
        }
        changedPaths.push(file.previous_filename);
      } else if (file?.previous_filename != null) {
        if (!isSafeRepositoryPath(file.previous_filename)) {
          throw new PreviewRequirementError(
            'GITHUB_FILES_INVALID',
            `GitHub reported an unsafe previous_filename for ${filename}.`,
          );
        }
        changedPaths.push(file.previous_filename);
      }
    }

    fileEntries += files.length;
    if (fileEntries > changedFileCount) {
      throw new PreviewRequirementError(
        'GITHUB_FILES_INCOMPLETE',
        `GitHub returned ${fileEntries} file entries but the PR reports ${changedFileCount}.`,
      );
    }
  }

  if (fileEntries !== changedFileCount) {
    throw new PreviewRequirementError(
      'GITHUB_FILES_INCOMPLETE',
      `GitHub returned ${fileEntries} of ${changedFileCount} changed-file entries.`,
    );
  }

  const classification = classifyPreviewRequirement({
    changedPaths,
    isVisual: isVisualPullRequest(pullRequest?.body),
  });

  return {
    expectedHeadSha,
    liveHeadSha,
    changedFileCount,
    isVisual: isVisualPullRequest(pullRequest?.body),
    ...classification,
  };
}

/**
 * @param {{
 *   initial: Awaited<ReturnType<typeof loadGitHubPreviewRequirement>>,
 *   final: Awaited<ReturnType<typeof loadGitHubPreviewRequirement>>,
 *   expectedHeadSha: string,
 * }} input
 */
export function assertStableRepositoryOnlyRequirement(input) {
  for (const snapshot of [input.initial, input.final]) {
    if (
      snapshot.expectedHeadSha !== input.expectedHeadSha ||
      snapshot.liveHeadSha !== input.expectedHeadSha
    ) {
      throw new PreviewRequirementError(
        'STALE_HEAD',
        `Repository-only Preview classification is not bound to expected head ${input.expectedHeadSha}.`,
      );
    }
    if (snapshot.previewRequired) {
      throw new PreviewRequirementError(
        'PREVIEW_REQUIREMENT_CHANGED',
        'Pull-request changes now require a native exact-head Preview.',
      );
    }
  }

  if (
    input.initial.isVisual !== input.final.isVisual ||
    input.initial.changedFileCount !== input.final.changedFileCount ||
    JSON.stringify(input.initial.changedPaths) !==
      JSON.stringify(input.final.changedPaths)
  ) {
    throw new PreviewRequirementError(
      'PREVIEW_REQUIREMENT_CHANGED',
      'Pull-request classification changed while Preview readiness was running. Retry on the current head.',
    );
  }

  return input.final;
}

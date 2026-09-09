#!/usr/bin/env node
// @ts-check

import { appendFile } from 'node:fs/promises';
import {
  assertStableRepositoryOnlyRequirement,
  loadGitHubPreviewRequirement,
} from './lib/preview-requirement.mjs';
import {
  loadGitHubPreviewEvidence,
  runPreviewReadiness,
} from './lib/preview-readiness.mjs';
import { createVercelPreviewFetch } from './lib/vercel-preview-fetch.mjs';

/** @param {string} name */
function requireEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}.`);
  return value;
}

/**
 * @param {string} name
 * @param {number} fallback
 */
function readPositiveInteger(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

/** @param {string} content */
async function appendStepSummary(content) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, content, 'utf8');
  }
}

/** @param {string[]} lines */
async function appendOutputs(lines) {
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`, 'utf8');
  }
}

async function main() {
  const repository = requireEnvironment('GITHUB_REPOSITORY');
  const prNumber = requireEnvironment('PR_NUMBER');
  const expectedHeadSha = requireEnvironment('EXPECTED_HEAD_SHA');
  const token = requireEnvironment('GITHUB_TOKEN');
  const shortSha = expectedHeadSha.slice(0, 12);

  const requirementInput = {
    repository,
    prNumber,
    expectedHeadSha,
    token,
  };
  const initialRequirement =
    await loadGitHubPreviewRequirement(requirementInput);

  if (!initialRequirement.previewRequired) {
    const finalRequirement = await loadGitHubPreviewRequirement(requirementInput);
    const requirement = assertStableRepositoryOnlyRequirement({
      initial: initialRequirement,
      final: finalRequirement,
      expectedHeadSha,
    });
    const summary = [
      '## Preview readiness',
      '',
      `- Head: \`${shortSha}\``,
      '- Mode: strict repository-only diff',
      '- Native Vercel Preview: not required',
      `- Changed file entries: ${requirement.changedFileCount}`,
      '- Production contract: GitHub Pages remains canonical production; Vercel is Preview/review only.',
      '',
    ].join('\n');

    await appendStepSummary(summary);
    await appendOutputs(['preview_required=false', 'preview_url=']);

    console.log(
      `Preview readiness passed for ${shortSha}: strict repository-only diff does not require a native Vercel Preview.`,
    );
    return;
  }

  const timeoutMs = readPositiveInteger('PREVIEW_WAIT_TIMEOUT_MS', 600_000);
  const pollIntervalMs = readPositiveInteger('PREVIEW_POLL_INTERVAL_MS', 5_000);
  const previewFetch = createVercelPreviewFetch(
    fetch,
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  );

  const loadEvidence = () =>
    loadGitHubPreviewEvidence({
      repository,
      prNumber,
      expectedHeadSha,
      token,
    });

  const result = await runPreviewReadiness({
    expectedHeadSha,
    loadEvidence,
    fetchImpl: previewFetch,
    timeoutMs,
    pollIntervalMs,
    onRetry(error) {
      console.log(
        `Waiting for Vercel evidence [${error.code}]: ${error.message}`,
      );
    },
  });

  const smokePaths = result.smoke.checkedPaths
    .map((path) => `\`${path}\``)
    .join(', ');
  const summary = [
    '## Preview readiness',
    '',
    `- Head: \`${shortSha}\``,
    '- Mode: deployed Preview required',
    `- Preview: ${result.evidence.previewUrl}`,
    `- Vercel inspector: ${result.evidence.inspectorUrl}`,
    `- Smoke: ${smokePaths}`,
    '- Production contract: GitHub Pages remains canonical production; Vercel is Preview/review only.',
    '',
  ].join('\n');

  await appendStepSummary(summary);
  await appendOutputs([
    'preview_required=true',
    `preview_url=${result.evidence.previewUrl}`,
  ]);

  console.log(`Preview readiness passed for ${shortSha}.`);
  console.log(`Validated Preview: ${result.evidence.previewUrl}`);
}

main().catch((error) => {
  const code =
    typeof error?.code === 'string' ? error.code : 'UNEXPECTED_ERROR';
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Preview readiness failed [${code}]: ${message}`);
  process.exitCode = 1;
});

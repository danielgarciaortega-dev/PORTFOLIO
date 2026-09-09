#!/usr/bin/env node
// @ts-check

import { appendFile } from 'node:fs/promises';
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

async function main() {
  const repository = requireEnvironment('GITHUB_REPOSITORY');
  const prNumber = requireEnvironment('PR_NUMBER');
  const expectedHeadSha = requireEnvironment('EXPECTED_HEAD_SHA');
  const token = requireEnvironment('GITHUB_TOKEN');
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

  const shortSha = expectedHeadSha.slice(0, 12);
  const smokePaths = result.smoke.checkedPaths
    .map((path) => `\`${path}\``)
    .join(', ');
  const summary = [
    '## Preview readiness',
    '',
    `- Head: \`${shortSha}\``,
    `- Preview: ${result.evidence.previewUrl}`,
    `- Vercel inspector: ${result.evidence.inspectorUrl}`,
    `- Smoke: ${smokePaths}`,
    '- Production contract: GitHub Pages remains canonical production; Vercel is Preview/review only.',
    '',
  ].join('\n');

  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, summary, 'utf8');
  }

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `preview_url=${result.evidence.previewUrl}\n`,
      'utf8',
    );
  }

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
import { assertMainRuleset } from './lib/main-ruleset-governance.mjs';

const repository = process.env.GITHUB_REPOSITORY;
const apiBase = process.env.GITHUB_API_URL ?? 'https://api.github.com';

if (!repository) {
  throw new Error('GITHUB_REPOSITORY is required');
}

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function getJson(path) {
  const response = await fetch(`${apiBase}${path}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} while reading ${path}`);
  }
  return response.json();
}

const rulesets = await getJson(`/repos/${repository}/rulesets`);
const protectMain = rulesets.find(
  (ruleset) => ruleset.name === 'Protect main' && ruleset.target === 'branch',
);

if (!protectMain) {
  throw new Error('Active branch ruleset Protect main was not found');
}

const ruleset = await getJson(
  `/repos/${repository}/rulesets/${protectMain.id}`,
);

assertMainRuleset(ruleset);
console.log('Protect main governance is safe: no PR bypass actors are configured.');

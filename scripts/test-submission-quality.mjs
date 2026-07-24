import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

async function loadTypeScriptModule(path) {
  const source = await readFile(path, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
}

const checker = await loadTypeScriptModule('src/lib/services/submission-checker.ts');
const scorer = await loadTypeScriptModule('src/lib/services/tool-quality-score.ts');

assert.equal(checker.normalizeDomain('https://www.Example.com/path'), 'example.com');

const invalid = await checker.checkSubmissionUrl('not-a-url');
assert.equal(invalid.checks[0].status, 'failed');

const insecure = await checker.checkSubmissionUrl('http://example.com');
assert.equal(insecure.checks.find((check) => check.checkType === 'https')?.status, 'failed');

const valid = await checker.checkSubmissionUrl('https://example.com', async () =>
  new Response('ok', { status: 200, headers: { 'content-type': 'text/html' } })
);
assert.equal(valid.domain, 'example.com');
assert.equal(valid.checks.find((check) => check.checkType === 'website_accessibility')?.status, 'passed');

const quality = scorer.calculateToolQualityScore({
  name: 'Example AI',
  description: 'A detailed description of an AI product that helps teams complete useful work faster and more reliably.',
  email: 'owner@example.com',
  category: 'AI Productivity',
  checks: valid.checks,
  blocked: false
});
assert.ok(quality.overall >= 70);
assert.equal(quality.securityScore, 10);
assert.notEqual(quality.recommendation, 'reject');

const blocked = scorer.calculateToolQualityScore({
  name: 'Blocked AI', checks: valid.checks, blocked: true
});
assert.equal(blocked.recommendation, 'reject');

console.log('Submission security and quality contract tests passed.');

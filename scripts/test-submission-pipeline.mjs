import assert from 'node:assert/strict';

const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:5173';

async function post(payload) {
  const response = await fetch(`${BASE}/api/submissions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return {
    status: response.status,
    body: await response.json()
  };
}

async function main() {
  const invalid = await post({ name: '', website: '' });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error, 'invalid_payload');

  const invalidUrl = await post({
    name: 'Example Tool',
    website: 'not-a-url'
  });
  assert.equal(invalidUrl.status, 400);

  console.log('submission pipeline smoke tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { verifyTurnstileToken } from '../src/lib/services/turnstile.js';

async function run() {
  process.env.E2E_TEST_MODE = 'true';

  const bypass = await verifyTurnstileToken({
    token: 'test-token',
    secret: 'ci-secret'
  });

  if (!bypass) {
    throw new Error('E2E bypass should accept test-token');
  }

  process.env.E2E_TEST_MODE = 'false';

  const missing = await verifyTurnstileToken({
    token: '',
    secret: 'ci-secret'
  });

  if (missing) {
    throw new Error('Missing token should be rejected');
  }

  const fake = await verifyTurnstileToken({
    token: 'fake-token',
    secret: ''
  });

  if (fake) {
    throw new Error('Fake token without secret should be rejected');
  }

  console.log('✓ Turnstile E2E cases passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

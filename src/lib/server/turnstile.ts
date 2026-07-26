export async function verifyTurnstileToken(token: string | undefined, secret: string | undefined): Promise<boolean> {
  if (process.env.E2E_TEST_MODE === 'true' && token === 'test-token') {
    return true;
  }

  if (!token || !secret) {
    return false;
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      secret,
      response: token
    })
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json() as { success?: boolean };
  return result.success === true;
}

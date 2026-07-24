export async function verifyTurnstileToken(token: string, secret: string) {
  if (!token || !secret) {
    return false;
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      secret,
      response: token,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const result = await response.json() as { success?: boolean };
  return result.success === true;
}

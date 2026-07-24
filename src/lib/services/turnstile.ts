export async function verifyTurnstileToken(input: {
  token: string;
  secret: string;
  remoteIp?: string;
  fetchImpl?: typeof fetch;
}): Promise<boolean> {
  if (!input.token || !input.secret) return false;

  const body = new URLSearchParams({ secret: input.secret, response: input.token });
  if (input.remoteIp) body.set('remoteip', input.remoteIp);

  try {
    const response = await (input.fetchImpl ?? fetch)(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body }
    );
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

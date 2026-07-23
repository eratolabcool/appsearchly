function constantTimeEqual(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < maxLength; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}

export function isAdminAuthorized(
  request: Request,
  platform: App.Platform | undefined
): boolean {
  const expectedToken = platform?.env?.ADMIN_API_TOKEN;
  if (!expectedToken || expectedToken.length < 32) return false;

  const authorization = request.headers.get('authorization') ?? '';
  const [scheme, suppliedToken] = authorization.split(/\s+/, 2);

  return (
    scheme?.toLowerCase() === 'bearer' &&
    Boolean(suppliedToken) &&
    constantTimeEqual(suppliedToken, expectedToken)
  );
}

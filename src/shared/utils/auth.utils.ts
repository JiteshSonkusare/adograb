/**
 * Builds a Basic auth header from a PAT.
 * Azure DevOps accepts Basic auth with an empty username and the PAT as password.
 */
export function buildBasicAuthHeader(pat: string): string {
  const token = Buffer.from(`:${pat}`).toString('base64');
  return `Basic ${token}`;
}

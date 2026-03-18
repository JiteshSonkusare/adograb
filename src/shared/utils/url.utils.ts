export function normalizeOrgUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function isValidAdoOrgUrl(url: string): boolean {
  try {
    const normalized = normalizeOrgUrl(url);
    const parsed = new URL(normalized);

    if (parsed.protocol !== 'https:') return false;

    // https://dev.azure.com/{org}
    const devAzureMatch =
      /^https:\/\/dev\.azure\.com\/[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9](\/)?$/.test(
        normalized
      ) || /^https:\/\/dev\.azure\.com\/[a-zA-Z0-9](\/)?$/.test(normalized);

    // https://{org}.visualstudio.com
    const visualStudioMatch =
      /^https:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*\.visualstudio\.com(\/)?$/.test(normalized);

    return devAzureMatch || visualStudioMatch;
  } catch {
    return false;
  }
}

export function buildAdoApiUrl(orgUrl: string, path: string): string {
  const base = normalizeOrgUrl(orgUrl);
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${cleanPath}`;
}

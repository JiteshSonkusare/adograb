import { isValidAdoOrgUrl } from '../../shared/utils/url.utils';

export function validateOrgUrl(url: string): string | null {
  if (!url?.trim()) return 'Organization URL is required.';
  if (!isValidAdoOrgUrl(url.trim())) {
    return (
      'Invalid Azure DevOps organization URL. ' +
      'Expected: https://dev.azure.com/{org} or https://{org}.visualstudio.com'
    );
  }
  return null;
}

export function validatePat(pat: string): string | null {
  if (!pat?.trim()) return 'Personal Access Token must not be empty.';
  if (pat.trim().length < 10) return 'Personal Access Token appears too short.';
  return null;
}

export function validateCloneRoot(path: string): string | null {
  if (!path?.trim()) return 'Clone destination folder is required.';
  return null;
}

export function validateRepoName(name: string): string | null {
  if (!name?.trim()) return 'Repository name is required.';
  return null;
}

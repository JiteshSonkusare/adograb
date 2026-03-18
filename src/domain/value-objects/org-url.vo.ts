import { isValidAdoOrgUrl, normalizeOrgUrl } from '../../shared/utils/url.utils';

export class OrgUrl {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): OrgUrl | Error {
    const trimmed = raw?.trim();
    if (!trimmed) {
      return new Error('Organization URL must not be empty.');
    }
    if (!isValidAdoOrgUrl(trimmed)) {
      return new Error(
        'Invalid Azure DevOps organization URL. ' +
          'Expected format: https://dev.azure.com/{org} or https://{org}.visualstudio.com'
      );
    }
    return new OrgUrl(normalizeOrgUrl(trimmed));
  }

  toString(): string {
    return this.value;
  }
}

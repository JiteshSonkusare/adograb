/**
 * Provides the Authorization header string for Azure DevOps API calls.
 * Implementations differ by auth mode (PAT vs default/GCM).
 */
export interface IAuthHeaderProvider {
  getAuthHeader(): Promise<string>;
}

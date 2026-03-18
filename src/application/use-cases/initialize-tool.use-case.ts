import { IConfigStore } from '../ports/config-store.port';
import { ISecretStore } from '../ports/secret-store.port';
import { AuthMode } from '../../domain/value-objects/auth-mode.vo';
import { CONFIG_KEYS, KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT } from '../../shared/constants/app.constants';
import { ConfigPersistenceError, SecureStoreError } from '../errors/app-errors';

export interface InitializeToolInput {
  orgUrl: string;
  projectId: string;
  projectName: string;
  authMode: AuthMode;
  pat?: string;
  cloneRoot: string;
}

export class InitializeToolUseCase {
  constructor(
    private readonly configStore: IConfigStore,
    private readonly secretStore: ISecretStore
  ) {}

  async execute(input: InitializeToolInput): Promise<void> {
    try {
      // Store PAT securely if PAT mode selected
      if (input.authMode === 'pat' && input.pat) {
        try {
          await this.secretStore.setSecret(KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT, input.pat);
        } catch (error) {
          throw new SecureStoreError('Failed to store PAT in secure store.', error);
        }
      }

      // If switching from PAT to default, remove the stored PAT
      const existingAuthMode = this.configStore.get(CONFIG_KEYS.AUTH_MODE) as AuthMode | undefined;
      if (existingAuthMode === 'pat' && input.authMode === 'default') {
        try {
          await this.secretStore.deleteSecret(KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT);
        } catch {
          // Non-fatal: old PAT removal failure should not block re-initialisation
        }
      }

      // Persist all configuration
      this.configStore.set(CONFIG_KEYS.ORG_URL, input.orgUrl);
      this.configStore.set(CONFIG_KEYS.PROJECT_ID, input.projectId);
      this.configStore.set(CONFIG_KEYS.PROJECT_NAME, input.projectName);
      this.configStore.set(CONFIG_KEYS.AUTH_MODE, input.authMode);
      this.configStore.set(CONFIG_KEYS.CLONE_ROOT, input.cloneRoot);
    } catch (error) {
      if (error instanceof SecureStoreError) throw error;
      throw new ConfigPersistenceError('Failed to save configuration.', error);
    }
  }
}

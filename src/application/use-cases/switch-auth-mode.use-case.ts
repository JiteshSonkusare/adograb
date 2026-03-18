import { IConfigStore } from '../ports/config-store.port';
import { ISecretStore } from '../ports/secret-store.port';
import { AuthMode } from '../../domain/value-objects/auth-mode.vo';
import { CONFIG_KEYS, KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT } from '../../shared/constants/app.constants';
import { ConfigPersistenceError, SecureStoreError } from '../errors/app-errors';

export interface SwitchAuthModeInput {
  authMode: AuthMode;
  pat?: string;
}

export class SwitchAuthModeUseCase {
  constructor(
    private readonly configStore: IConfigStore,
    private readonly secretStore: ISecretStore
  ) {}

  async execute(input: SwitchAuthModeInput): Promise<void> {
    if (input.authMode === 'pat') {
      if (!input.pat) {
        throw new SecureStoreError('A PAT is required when switching to PAT authentication mode.');
      }
      try {
        await this.secretStore.setSecret(KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT, input.pat);
      } catch (error) {
        throw new SecureStoreError('Failed to store PAT in secure store.', error);
      }
    } else {
      // Switching to default mode — remove any stored PAT
      try {
        await this.secretStore.deleteSecret(KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT);
      } catch {
        // Non-fatal: PAT may not exist
      }
    }

    try {
      this.configStore.set(CONFIG_KEYS.AUTH_MODE, input.authMode);
    } catch (error) {
      throw new ConfigPersistenceError('Failed to save authentication mode.', error);
    }
  }
}

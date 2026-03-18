import { IConfigStore } from '../ports/config-store.port';
import { ISecretStore } from '../ports/secret-store.port';
import { KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT } from '../../shared/constants/app.constants';
import { ConfigPersistenceError } from '../errors/app-errors';

export class ResetConfigUseCase {
  constructor(
    private readonly configStore: IConfigStore,
    private readonly secretStore: ISecretStore
  ) {}

  async execute(): Promise<void> {
    try {
      this.configStore.clear();
    } catch (error) {
      throw new ConfigPersistenceError('Failed to clear configuration.', error);
    }

    try {
      await this.secretStore.deleteSecret(KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT);
    } catch {
      // Non-fatal: PAT may not exist; ignore removal failure
    }
  }
}

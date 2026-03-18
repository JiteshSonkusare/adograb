import { createRequire } from 'module';
import { ISecretStore } from '../../application/ports/secret-store.port';

// keytar is a native CJS module — use createRequire for reliable ESM/CJS interop
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const keytar = require('keytar') as typeof import('keytar');

export class KeytarStore implements ISecretStore {
  async setSecret(service: string, account: string, secret: string): Promise<void> {
    await keytar.setPassword(service, account, secret);
  }

  async getSecret(service: string, account: string): Promise<string | null> {
    return keytar.getPassword(service, account);
  }

  async deleteSecret(service: string, account: string): Promise<boolean> {
    return keytar.deletePassword(service, account);
  }
}

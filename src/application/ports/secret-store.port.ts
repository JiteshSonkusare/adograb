export interface ISecretStore {
  setSecret(service: string, account: string, secret: string): Promise<void>;
  getSecret(service: string, account: string): Promise<string | null>;
  deleteSecret(service: string, account: string): Promise<boolean>;
}

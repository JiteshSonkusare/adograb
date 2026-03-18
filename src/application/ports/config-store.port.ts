export interface IConfigStore {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  getAll(): Record<string, unknown>;
  clear(): void;
  has(key: string): boolean;
}

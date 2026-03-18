import Conf from 'conf';
import { IConfigStore } from '../../application/ports/config-store.port';
import { APP_NAME } from '../../shared/constants/app.constants';

export class ConfStore implements IConfigStore {
  private readonly conf: Conf<Record<string, unknown>>;

  constructor() {
    this.conf = new Conf<Record<string, unknown>>({
      projectName: APP_NAME,
    });
  }

  get(key: string): unknown {
    return this.conf.get(key as never);
  }

  set(key: string, value: unknown): void {
    this.conf.set(key as never, value);
  }

  getAll(): Record<string, unknown> {
    return this.conf.store as Record<string, unknown>;
  }

  clear(): void {
    this.conf.clear();
  }

  has(key: string): boolean {
    return this.conf.has(key as never);
  }
}

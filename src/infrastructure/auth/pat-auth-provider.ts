import { IAuthHeaderProvider } from '../../application/ports/auth-provider.port';
import { buildBasicAuthHeader } from '../../shared/utils/auth.utils';

export class PatAuthHeaderProvider implements IAuthHeaderProvider {
  constructor(private readonly pat: string) {}

  async getAuthHeader(): Promise<string> {
    return buildBasicAuthHeader(this.pat);
  }
}

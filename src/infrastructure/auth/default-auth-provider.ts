import { execa } from 'execa';
import { IAuthHeaderProvider } from '../../application/ports/auth-provider.port';
import { AuthenticationError } from '../../application/errors/app-errors';

/**
 * Retrieves credentials from the Git Credential Manager (GCM) for the given
 * organisation URL and builds a Basic auth header.
 *
 * Works on Windows (Git Credential Manager) and macOS (GCM or Keychain helper).
 */
export class DefaultAuthHeaderProvider implements IAuthHeaderProvider {
  constructor(private readonly orgUrl: string) {}

  async getAuthHeader(): Promise<string> {
    try {
      const url = new URL(this.orgUrl);
      const host = url.hostname;

      const { stdout } = await execa('git', ['credential', 'fill'], {
        input: `protocol=https\nhost=${host}\n\n`,
      });

      const lines = stdout.split('\n');
      const usernameLine = lines.find((l) => l.startsWith('username='));
      const passwordLine = lines.find((l) => l.startsWith('password='));

      const username = usernameLine?.split('=').slice(1).join('=').trim() ?? '';
      const password = passwordLine?.split('=').slice(1).join('=').trim() ?? '';

      if (!password) {
        throw new AuthenticationError(
          'No credentials found in Git Credential Manager for this host. ' +
            "Run 'adograb auth switch' to configure PAT authentication instead."
        );
      }

      const token = Buffer.from(`${username}:${password}`).toString('base64');
      return `Basic ${token}`;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError(
        'Could not retrieve credentials from Git Credential Manager. ' +
          "Run 'adograb auth switch' to configure PAT authentication.\n" +
          `Details: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

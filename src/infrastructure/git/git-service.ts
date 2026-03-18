import { execa } from 'execa';
import { IGitService, CloneOptions } from '../../application/ports/git-service.port';
import { CloneError } from '../../application/errors/app-errors';

export class GitService implements IGitService {
  async clone(options: CloneOptions): Promise<void> {
    const { cloneUrl, targetPath, pat } = options;

    // For PAT auth, embed credentials in the clone URL:
    // https://:${pat}@dev.azure.com/{org}/{project}/_git/{repo}
    const url = pat ? this.embedPatInUrl(cloneUrl, pat) : cloneUrl;

    try {
      await execa('git', ['clone', url, targetPath], {
        stdio: 'pipe',
      });
    } catch (error) {
      const cause = error instanceof Error ? error : undefined;
      const stderr =
        error &&
        typeof error === 'object' &&
        'stderr' in error &&
        typeof (error as { stderr: unknown }).stderr === 'string'
          ? (error as { stderr: string }).stderr
          : '';

      if (stderr.includes('Authentication failed') || stderr.includes('could not read Username')) {
        throw new CloneError(
          'Authentication failed during clone. ' +
            'Check your credentials or run `adograb auth switch`.',
          cause
        );
      }

      if (stderr.includes('Repository not found') || stderr.includes('not found')) {
        throw new CloneError(
          `Repository not found or you do not have access to it.`,
          cause
        );
      }

      const message =
        stderr ||
        (cause?.message ?? 'git clone failed. Check your network connection and permissions.');

      throw new CloneError(message, cause);
    }
  }

  private embedPatInUrl(remoteUrl: string, pat: string): string {
    const url = new URL(remoteUrl);
    url.username = '';
    url.password = pat;
    return url.toString();
  }
}

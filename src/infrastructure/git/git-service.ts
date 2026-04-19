import { execa } from 'execa';
import { IGitService, CloneOptions, GitStatusResult } from '../../application/ports/git-service.port';
import { CloneError } from '../../application/errors/app-errors';

export class GitService implements IGitService {
  async clone(options: CloneOptions): Promise<void> {
    const { cloneUrl, targetPath, pat } = options;
    const url = pat ? this.embedPatInUrl(cloneUrl, pat) : cloneUrl;

    try {
      await execa('git', ['clone', url, targetPath], { stdio: 'pipe' });
    } catch (error) {
      const cause = error instanceof Error ? error : undefined;
      const stderr = this.extractStderr(error);

      if (stderr.includes('Authentication failed') || stderr.includes('could not read Username')) {
        throw new CloneError(
          'Authentication failed during clone. ' +
            'Check your credentials or run `adograb auth switch`.',
          cause
        );
      }

      if (stderr.includes('Repository not found') || stderr.includes('not found')) {
        throw new CloneError(
          'Repository not found or you do not have access to it.',
          cause
        );
      }

      throw new CloneError(
        stderr || cause?.message || 'git clone failed. Check your network connection and permissions.',
        cause
      );
    }
  }

  async pull(repoPath: string): Promise<void> {
    try {
      await execa('git', ['pull'], { cwd: repoPath, stdio: 'pipe' });
    } catch (error) {
      const stderr = this.extractStderr(error);
      const message = error instanceof Error ? error.message : 'git pull failed.';
      throw new Error(`Pull failed: ${stderr || message}`);
    }
  }

  async getStatus(repoPath: string): Promise<GitStatusResult> {
    try {
      const [statusResult, branchResult] = await Promise.all([
        execa('git', ['status', '--porcelain'], { cwd: repoPath, stdio: 'pipe' }),
        execa('git', ['branch', '--show-current'], { cwd: repoPath, stdio: 'pipe' }),
      ]);
      return {
        isDirty: statusResult.stdout.trim().length > 0,
        currentBranch: branchResult.stdout.trim(),
      };
    } catch {
      return { isDirty: false, currentBranch: '' };
    }
  }

  private embedPatInUrl(remoteUrl: string, pat: string): string {
    const url = new URL(remoteUrl);
    url.username = '';
    url.password = pat;
    return url.toString();
  }

  private extractStderr(error: unknown): string {
    return error &&
      typeof error === 'object' &&
      'stderr' in error &&
      typeof (error as { stderr: unknown }).stderr === 'string'
      ? (error as { stderr: string }).stderr
      : '';
  }
}

import { IGitService } from '../../application/ports/git-service.port';
import { IConfigStore } from '../../application/ports/config-store.port';
import { detectInstalledIdes } from '../../infrastructure/ide/ide-detector';
import { launchIde } from '../../infrastructure/ide/ide-launcher';
import { promptPullLatest, promptIdeSelection } from '../prompts/ide.prompts';
import { Formatter } from '../formatters/output.formatter';

const LAST_USED_IDE_KEY = 'lastUsedIde';

export async function runPostCloneFlow(
  repoPath: string,
  alreadyExisted: boolean,
  gitService: IGitService,
  configStore: IConfigStore
): Promise<void> {
  if (alreadyExisted) {
    const status = await gitService.getStatus(repoPath);
    const pullChoice = await promptPullLatest(status.isDirty, status.currentBranch);

    if (pullChoice === 'pull') {
      try {
        await gitService.pull(repoPath);
        Formatter.success('Pulled latest changes.');
      } catch (err) {
        Formatter.warn(
          err instanceof Error ? err.message : 'Pull failed. Continuing to IDE selection.'
        );
      }
    }
  }

  const ides = await detectInstalledIdes();

  if (ides.length === 0) {
    Formatter.warn('No supported IDEs detected. Open the repository manually.');
    return;
  }

  const lastUsedIdeId = configStore.get(LAST_USED_IDE_KEY) as string | undefined;
  const selected = await promptIdeSelection(ides, lastUsedIdeId);

  if (!selected) {
    Formatter.warn('Cancelled.');
    return;
  }

  configStore.set(LAST_USED_IDE_KEY, selected.id);
  launchIde(selected, repoPath);
  Formatter.success(`Opening in ${selected.label}...`);
}

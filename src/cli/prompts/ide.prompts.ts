import { confirm, select } from '@inquirer/prompts';
import { DetectedIde } from '../../infrastructure/ide/ide-detector';

export async function promptPullLatest(isDirty: boolean, currentBranch: string): Promise<'pull' | 'skip'> {
  const branchLabel = currentBranch ? ` (${currentBranch})` : '';

  if (!isDirty) {
    const doPull = await confirm({
      message: `Pull latest changes${branchLabel}?`,
      default: true,
    });
    return doPull ? 'pull' : 'skip';
  }

  const choice = await select<'pull' | 'skip'>({
    message: `Repository has uncommitted changes${branchLabel}. What would you like to do?`,
    choices: [
      { name: 'Skip pull — open as-is', value: 'skip' },
      { name: 'Pull anyway (may fail with uncommitted changes)', value: 'pull' },
    ],
  });
  return choice;
}

export async function promptIdeSelection(
  ides: DetectedIde[],
  lastUsedIdeId?: string
): Promise<DetectedIde | null> {
  const defaultIde = ides.find((ide) => ide.id === lastUsedIdeId) ?? ides[0];

  const choice = await select<DetectedIde | null>({
    message: 'Open in IDE:',
    default: defaultIde ?? null,
    choices: [
      ...ides.map((ide) => ({ name: ide.label, value: ide })),
      { name: 'Cancel', value: null },
    ],
  });
  return choice;
}

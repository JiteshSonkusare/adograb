import search from '@inquirer/search';
import { confirm } from '@inquirer/prompts';
import { RepositoryDto } from '../../application/dto/repository.dto';

const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

export async function promptRepoSelection(repos: RepositoryDto[]): Promise<RepositoryDto> {
  return search<RepositoryDto>({
    message: 'Select a repository to clone (type to filter):',
    source: (input) => {
      const term = (input ?? '').toLowerCase();
      return repos
        .filter((r) => r.name.toLowerCase().includes(term))
        .map((r) => ({
          name: `[ ] ${r.name}`,
          value: r,
          description: r.defaultBranch ? `Default branch: ${r.defaultBranch}` : undefined,
        }));
    },
    pageSize: 20,
    theme: {
      icon: { cursor: '' },
      style: {
        highlight: (text: string) => `${CYAN}${text.replace('[ ]', '[X]')}${RESET}`,
      },
    },
  });
}

export async function promptConfirmClone(repoName: string, targetPath: string): Promise<boolean> {
  return confirm({
    message: `Clone "${repoName}" into ${targetPath}?`,
    default: true,
  });
}

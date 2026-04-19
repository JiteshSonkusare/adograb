import { Command } from 'commander';
import { ConfStore } from '../../infrastructure/config/conf-store';
import { KeytarStore } from '../../infrastructure/secrets/keytar-store';
import { AdoClient } from '../../infrastructure/ado/ado-client';
import { GitService } from '../../infrastructure/git/git-service';
import { PatAuthHeaderProvider } from '../../infrastructure/auth/pat-auth-provider';
import { DefaultAuthHeaderProvider } from '../../infrastructure/auth/default-auth-provider';
import { ValidateSetupUseCase } from '../../application/use-cases/validate-setup.use-case';
import { ListRepositoriesUseCase } from '../../application/use-cases/list-repositories.use-case';
import { CloneRepositoryUseCase } from '../../application/use-cases/clone-repository.use-case';
import { promptRepoSelection, promptConfirmClone } from '../prompts/repo-select.prompts';
import { runPostCloneFlow } from '../helpers/post-clone-flow';
import { Formatter } from '../formatters/output.formatter';
import { AppError } from '../../application/errors/app-errors';
import { KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT } from '../../shared/constants/app.constants';
import path from 'path';
import fs from 'fs';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('Browse and interactively clone repositories from your Azure DevOps project.')
    .action(async () => {
      await runInteractiveList();
    });
}

export async function runInteractiveList(): Promise<void> {
  try {
    const configStore = new ConfStore();
    const secretStore = new KeytarStore();
    const adoClient = new AdoClient();
    const gitService = new GitService();

    const validateSetup = new ValidateSetupUseCase(configStore);
    const config = validateSetup.execute();

    Formatter.section(`ADO Repo Lister — ${config.projectName}`);
    Formatter.info('Fetching repositories...');

    let pat: string | undefined;
    if (config.authMode === 'pat') {
      const stored = await secretStore.getSecret(KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT);
      if (stored) pat = stored;
    }

    const authProvider =
      config.authMode === 'pat' && pat
        ? new PatAuthHeaderProvider(pat)
        : new DefaultAuthHeaderProvider(config.orgUrl);

    const listRepos = new ListRepositoriesUseCase(adoClient, authProvider);
    const repos = await listRepos.execute({
      orgUrl: config.orgUrl,
      projectId: config.projectId,
    });

    if (repos.length === 0) {
      Formatter.warn('No repositories found in this project.');
      return;
    }

    Formatter.info(`Found ${repos.length} repositories.\n`);

    const selected = await promptRepoSelection(repos);
    const targetPath = path.join(config.cloneRoot, selected.name);
    const alreadyExists = fs.existsSync(targetPath);

    if (!alreadyExists) {
      const confirmed = await promptConfirmClone(selected.name, targetPath);
      if (!confirmed) {
        Formatter.warn('Clone cancelled.');
        return;
      }
      Formatter.info(`Cloning "${selected.name}"...`);
    } else {
      Formatter.info(`Repository already exists at:\n   ${targetPath}`);
    }

    const cloneUseCase = new CloneRepositoryUseCase(adoClient, authProvider, gitService, secretStore);
    const result = await cloneUseCase.execute({
      orgUrl: config.orgUrl,
      projectId: config.projectId,
      repoName: selected.name,
      cloneRoot: config.cloneRoot,
      authMode: config.authMode,
    });

    if (!result.alreadyExisted) {
      Formatter.success(`Cloned "${result.repository.name}" to:\n   ${result.clonedTo}`);
    }

    await runPostCloneFlow(result.clonedTo, result.alreadyExisted, gitService, configStore);
  } catch (error) {
    if (error instanceof AppError) {
      Formatter.error(error.message);
    } else if (error instanceof Error) {
      if (error.message.includes('User force closed')) {
        Formatter.warn('Cancelled.');
      } else {
        Formatter.error(error.message);
      }
    } else {
      Formatter.error('An unexpected error occurred.');
    }
    process.exit(1);
  }
}

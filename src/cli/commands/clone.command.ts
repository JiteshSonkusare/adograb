import { Command } from 'commander';
import { ConfStore } from '../../infrastructure/config/conf-store';
import { KeytarStore } from '../../infrastructure/secrets/keytar-store';
import { AdoClient } from '../../infrastructure/ado/ado-client';
import { GitService } from '../../infrastructure/git/git-service';
import { PatAuthHeaderProvider } from '../../infrastructure/auth/pat-auth-provider';
import { DefaultAuthHeaderProvider } from '../../infrastructure/auth/default-auth-provider';
import { ValidateSetupUseCase } from '../../application/use-cases/validate-setup.use-case';
import { CloneRepositoryUseCase } from '../../application/use-cases/clone-repository.use-case';
import { runPostCloneFlow } from '../helpers/post-clone-flow';
import { Formatter } from '../formatters/output.formatter';
import { AppError } from '../../application/errors/app-errors';
import { KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT } from '../../shared/constants/app.constants';

export function registerCloneCommand(program: Command): void {
  program
    .command('clone <name>')
    .description('Clone a repository by name directly, without the interactive menu.')
    .action(async (name: string) => {
      try {
        const configStore = new ConfStore();
        const secretStore = new KeytarStore();
        const adoClient = new AdoClient();
        const gitService = new GitService();

        const validateSetup = new ValidateSetupUseCase(configStore);
        const config = validateSetup.execute();

        let pat: string | undefined;
        if (config.authMode === 'pat') {
          const stored = await secretStore.getSecret(KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT);
          if (stored) pat = stored;
        }

        const authProvider =
          config.authMode === 'pat' && pat
            ? new PatAuthHeaderProvider(pat)
            : new DefaultAuthHeaderProvider(config.orgUrl);

        Formatter.info(`Cloning "${name}"...`);

        const cloneUseCase = new CloneRepositoryUseCase(
          adoClient,
          authProvider,
          gitService,
          secretStore
        );
        const result = await cloneUseCase.execute({
          orgUrl: config.orgUrl,
          projectId: config.projectId,
          repoName: name,
          cloneRoot: config.cloneRoot,
          authMode: config.authMode,
        });

        if (!result.alreadyExisted) {
          Formatter.success(`Cloned "${result.repository.name}" to:\n   ${result.clonedTo}`);
        } else {
          Formatter.info(`Repository already exists at:\n   ${result.clonedTo}`);
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
    });
}

import { Command } from 'commander';
import { ConfStore } from '../../infrastructure/config/conf-store';
import { KeytarStore } from '../../infrastructure/secrets/keytar-store';
import { AdoClient } from '../../infrastructure/ado/ado-client';
import { PatAuthHeaderProvider } from '../../infrastructure/auth/pat-auth-provider';
import { DefaultAuthHeaderProvider } from '../../infrastructure/auth/default-auth-provider';
import { ValidateSetupUseCase } from '../../application/use-cases/validate-setup.use-case';
import { ListProjectsUseCase } from '../../application/use-cases/list-projects.use-case';
import { SwitchProjectUseCase } from '../../application/use-cases/switch-project.use-case';
import { promptProjectSwitch } from '../prompts/project-select.prompts';
import { Formatter } from '../formatters/output.formatter';
import { AppError } from '../../application/errors/app-errors';
import { KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT } from '../../shared/constants/app.constants';

export function registerProjectCommand(program: Command): void {
  const project = program
    .command('project')
    .description('Manage the active Azure DevOps project.');

  project
    .command('switch')
    .description('Switch to a different project in the same organization.')
    .action(async () => {
      try {
        const configStore = new ConfStore();
        const secretStore = new KeytarStore();
        const adoClient = new AdoClient();

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

        Formatter.info('Fetching projects...');

        const listProjects = new ListProjectsUseCase(adoClient, authProvider);
        const projects = await listProjects.execute({ orgUrl: config.orgUrl });

        if (projects.length === 0) {
          Formatter.warn('No projects found in this organization.');
          return;
        }

        const selected = await promptProjectSwitch(projects);

        const switchProject = new SwitchProjectUseCase(configStore);
        switchProject.execute({ project: selected });

        Formatter.success(`Switched to project "${selected.name}".`);
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

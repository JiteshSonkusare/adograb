import { Command } from 'commander';
import { ConfStore } from '../../infrastructure/config/conf-store';
import { KeytarStore } from '../../infrastructure/secrets/keytar-store';
import { AdoClient } from '../../infrastructure/ado/ado-client';
import { PatAuthHeaderProvider } from '../../infrastructure/auth/pat-auth-provider';
import { DefaultAuthHeaderProvider } from '../../infrastructure/auth/default-auth-provider';
import { InitializeToolUseCase } from '../../application/use-cases/initialize-tool.use-case';
import { ListProjectsUseCase } from '../../application/use-cases/list-projects.use-case';
import {
  promptOrgUrl,
  promptAuthMode,
  promptPat,
  promptProjectSelection,
  promptCloneRoot,
} from '../prompts/setup.prompts';
import { Formatter } from '../formatters/output.formatter';
import { AppError } from '../../application/errors/app-errors';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description(
      'Run first-time setup: configure your Azure DevOps organization, project, and authentication.'
    )
    .action(async () => {
      try {
        Formatter.section('adograb — First-time Setup');

        // Infrastructure
        const configStore = new ConfStore();
        const secretStore = new KeytarStore();
        const adoClient = new AdoClient();

        // Step 1: Org URL
        const orgUrl = await promptOrgUrl();

        // Step 2: Auth mode
        const authMode = await promptAuthMode();

        // Step 3: PAT if selected
        let pat: string | undefined;
        if (authMode === 'pat') {
          pat = await promptPat();
        }

        // Step 4: Fetch and select project
        Formatter.info('Connecting to Azure DevOps...');

        const authProvider =
          authMode === 'pat' && pat
            ? new PatAuthHeaderProvider(pat)
            : new DefaultAuthHeaderProvider(orgUrl);

        const listProjectsUseCase = new ListProjectsUseCase(adoClient, authProvider);
        const projects = await listProjectsUseCase.execute({ orgUrl });

        if (projects.length === 0) {
          Formatter.error(
            'No projects found in this organization. Check your access permissions.'
          );
          process.exit(1);
        }

        const selectedProject = await promptProjectSelection(projects);

        // Step 5: Clone destination folder
        const cloneRoot = await promptCloneRoot();

        // Step 6: Save configuration
        const initializeToolUseCase = new InitializeToolUseCase(configStore, secretStore);
        await initializeToolUseCase.execute({
          orgUrl,
          projectId: selectedProject.id,
          projectName: selectedProject.name,
          authMode,
          pat,
          cloneRoot,
        });

        Formatter.success(
          `Setup complete! Project "${selectedProject.name}" saved.\n` +
            `   Repositories will be cloned to: ${cloneRoot}\n\n` +
            `   Run 'adograb' to browse and clone repositories.`
        );
      } catch (error) {
        if (error instanceof AppError) {
          Formatter.error(error.message);
        } else if (error instanceof Error) {
          // Catch inquirer cancellation (Ctrl+C) gracefully
          if (error.message.includes('User force closed')) {
            Formatter.warn('Setup cancelled.');
          } else {
            Formatter.error(error.message);
          }
        } else {
          Formatter.error('An unexpected error occurred during setup.');
        }
        process.exit(1);
      }
    });
}

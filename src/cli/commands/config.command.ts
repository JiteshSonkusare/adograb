import { Command } from 'commander';
import { ConfStore } from '../../infrastructure/config/conf-store';
import { KeytarStore } from '../../infrastructure/secrets/keytar-store';
import { GetSavedConfigUseCase } from '../../application/use-cases/get-saved-config.use-case';
import { ResetConfigUseCase } from '../../application/use-cases/reset-config.use-case';
import { Formatter } from '../formatters/output.formatter';
import { AppError, MissingConfigError } from '../../application/errors/app-errors';
import { confirm } from '@inquirer/prompts';

export function registerConfigCommand(program: Command): void {
  const config = program
    .command('config')
    .description('Manage adograb configuration.');

  config
    .command('show')
    .description('Show the current saved configuration.')
    .action(() => {
      try {
        const configStore = new ConfStore();
        const getConfig = new GetSavedConfigUseCase(configStore);
        const cfg = getConfig.execute();

        Formatter.section('Current Configuration');
        Formatter.config({
          'Organization URL': cfg.orgUrl,
          'Project':         `${cfg.projectName} (${cfg.projectId})`,
          'Auth mode':       cfg.authMode,
          'Clone root':      cfg.cloneRoot,
        });
      } catch (error) {
        if (error instanceof MissingConfigError) {
          Formatter.warn('No configuration found. Run `adograb init` to set up the tool.');
        } else if (error instanceof AppError) {
          Formatter.error(error.message);
        } else if (error instanceof Error) {
          Formatter.error(error.message);
        } else {
          Formatter.error('An unexpected error occurred.');
        }
        process.exit(1);
      }
    });

  config
    .command('reset')
    .description('Reset all configuration and remove stored credentials.')
    .action(async () => {
      try {
        const confirmed = await confirm({
          message: 'This will remove all saved configuration and credentials. Continue?',
          default: false,
        });

        if (!confirmed) {
          Formatter.warn('Reset cancelled.');
          return;
        }

        const configStore = new ConfStore();
        const secretStore = new KeytarStore();
        const resetConfig = new ResetConfigUseCase(configStore, secretStore);
        await resetConfig.execute();

        Formatter.success('Configuration reset. Run `adograb init` to set up again.');
      } catch (error) {
        if (error instanceof AppError) {
          Formatter.error(error.message);
        } else if (error instanceof Error) {
          if (error.message.includes('User force closed')) {
            Formatter.warn('Reset cancelled.');
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

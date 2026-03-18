import { Command } from 'commander';
import { ConfStore } from '../../infrastructure/config/conf-store';
import { KeytarStore } from '../../infrastructure/secrets/keytar-store';
import { ValidateSetupUseCase } from '../../application/use-cases/validate-setup.use-case';
import { SwitchAuthModeUseCase } from '../../application/use-cases/switch-auth-mode.use-case';
import { promptAuthMode, promptPat } from '../prompts/setup.prompts';
import { Formatter } from '../formatters/output.formatter';
import { AppError } from '../../application/errors/app-errors';

export function registerAuthCommand(program: Command): void {
  const auth = program
    .command('auth')
    .description('Manage authentication settings.');

  auth
    .command('switch')
    .description('Switch between authentication modes (default Git credentials or PAT token).')
    .action(async () => {
      try {
        const configStore = new ConfStore();
        const secretStore = new KeytarStore();

        const validateSetup = new ValidateSetupUseCase(configStore);
        const config = validateSetup.execute();

        Formatter.section('Switch Authentication Mode');
        Formatter.info(`Current mode: ${config.authMode}\n`);

        const authMode = await promptAuthMode();

        let pat: string | undefined;
        if (authMode === 'pat') {
          pat = await promptPat();
        }

        const switchAuthMode = new SwitchAuthModeUseCase(configStore, secretStore);
        await switchAuthMode.execute({ authMode, pat });

        if (authMode === 'pat') {
          Formatter.success('Switched to PAT authentication. PAT stored securely.');
        } else {
          Formatter.success('Switched to default Git Credential Manager authentication.');
        }
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

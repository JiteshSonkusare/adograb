import { Command } from 'commander';
import { APP_NAME, APP_VERSION } from './shared/constants/app.constants';
import { registerInitCommand } from './cli/commands/init.command';
import { registerListCommand, runInteractiveList } from './cli/commands/list.command';
import { registerCloneCommand } from './cli/commands/clone.command';
import { registerConfigCommand } from './cli/commands/config.command';
import { registerProjectCommand } from './cli/commands/project.command';
import { registerAuthCommand } from './cli/commands/auth.command';
import { Formatter } from './cli/formatters/output.formatter';
import { MissingConfigError } from './application/errors/app-errors';

const program = new Command();

program
  .name(APP_NAME)
  .description('Browse and clone Azure DevOps repositories from the terminal.')
  .version(APP_VERSION, '-v, --version', 'Show version number')
  .addHelpText(
    'after',
    `
Examples:
  $ adograb init              Run first-time setup
  $ adograb                   Browse and clone repositories (interactive)
  $ adograb list              Browse and clone repositories (interactive)
  $ adograb clone <name>      Clone a repository directly by name
  $ adograb config show       Show current configuration
  $ adograb config reset      Reset all configuration
  $ adograb project switch    Switch to a different project
  $ adograb auth switch       Switch authentication mode

Uninstall:
  $ adograb config reset      Clear all saved config and credentials first
  $ npm uninstall -g adograb  Then remove the tool`
  );

// Register commands
registerInitCommand(program);
registerListCommand(program);
registerCloneCommand(program);
registerConfigCommand(program);
registerProjectCommand(program);
registerAuthCommand(program);

// Default action — interactive repo browser
program.action(async () => {
  try {
    await runInteractiveList();
  } catch (error) {
    if (error instanceof MissingConfigError) {
      Formatter.warn(
        'Setup required. Run `adograb init` to configure the tool, ' +
          'then run `adograb` again to browse repositories.'
      );
      process.exit(1);
    }
    throw error;
  }
});

program.parseAsync(process.argv).catch((error: unknown) => {
  if (error instanceof Error) {
    Formatter.error(error.message);
  } else {
    Formatter.error('An unexpected error occurred.');
  }
  process.exit(1);
});

import { input, select, password } from '@inquirer/prompts';
import { AuthMode } from '../../domain/value-objects/auth-mode.vo';
import { ProjectDto } from '../../application/dto/project.dto';
import {
  validateOrgUrl,
  validatePat,
  validateCloneRoot,
} from '../../domain/rules/validation.rules';
import path from 'path';

export async function promptOrgUrl(): Promise<string> {
  return input({
    message: 'Azure DevOps organization URL:',
    validate: (value) => {
      const error = validateOrgUrl(value);
      return error ?? true;
    },
  });
}

export async function promptAuthMode(): Promise<AuthMode> {
  return select<AuthMode>({
    message: 'Select authentication mode:',
    choices: [
      {
        name: 'Default  (Git Credential Manager)',
        value: 'default',
        description:
          'Uses your existing machine credentials managed by Git Credential Manager.',
      },
      {
        name: 'PAT Token',
        value: 'pat',
        description:
          'Uses a Personal Access Token you provide. The PAT is stored securely in the OS credential store.',
      },
    ],
  });
}

export async function promptPat(): Promise<string> {
  return password({
    message: 'Enter your Personal Access Token (PAT):',
    mask: '*',
    validate: (value) => {
      const error = validatePat(value);
      return error ?? true;
    },
  });
}

export async function promptProjectSelection(projects: ProjectDto[]): Promise<ProjectDto> {
  return select<ProjectDto>({
    message: 'Select a project:',
    choices: projects.map((p) => ({
      name: p.name,
      value: p,
      description: p.description,
    })),
  });
}

export async function promptCloneRoot(): Promise<string> {
  const cwd = process.cwd();
  const answer = await input({
    message: `Clone destination folder: (press Enter for "${cwd}")`,
    validate: (value) => {
      const resolved = value?.trim() || cwd;
      const error = validateCloneRoot(resolved);
      return error ?? true;
    },
    transformer: (value) => {
      return value?.trim() ? path.normalize(value.trim()) : '';
    },
  });
  return answer.trim() || cwd;
}

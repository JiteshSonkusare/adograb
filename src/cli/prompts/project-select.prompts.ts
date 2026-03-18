import { select } from '@inquirer/prompts';
import { ProjectDto } from '../../application/dto/project.dto';

export async function promptProjectSwitch(projects: ProjectDto[]): Promise<ProjectDto> {
  return select<ProjectDto>({
    message: 'Select a project to switch to:',
    choices: projects.map((p) => ({
      name: p.name,
      value: p,
      description: p.description,
    })),
  });
}

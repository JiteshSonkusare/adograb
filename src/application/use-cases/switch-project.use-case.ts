import { IConfigStore } from '../ports/config-store.port';
import { ProjectDto } from '../dto/project.dto';
import { CONFIG_KEYS } from '../../shared/constants/app.constants';
import { ConfigPersistenceError } from '../errors/app-errors';

export interface SwitchProjectInput {
  project: ProjectDto;
}

export class SwitchProjectUseCase {
  constructor(private readonly configStore: IConfigStore) {}

  execute(input: SwitchProjectInput): void {
    try {
      this.configStore.set(CONFIG_KEYS.PROJECT_ID, input.project.id);
      this.configStore.set(CONFIG_KEYS.PROJECT_NAME, input.project.name);
    } catch (error) {
      throw new ConfigPersistenceError('Failed to save project selection.', error);
    }
  }
}

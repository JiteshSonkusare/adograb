import { IConfigStore } from '../ports/config-store.port';
import { AppConfigDto } from '../dto/config.dto';
import { MissingConfigError } from '../errors/app-errors';
import { CONFIG_KEYS } from '../../shared/constants/app.constants';
import { AuthMode } from '../../domain/value-objects/auth-mode.vo';

export class ValidateSetupUseCase {
  constructor(private readonly configStore: IConfigStore) {}

  execute(): AppConfigDto {
    const orgUrl = this.configStore.get(CONFIG_KEYS.ORG_URL) as string | undefined;
    const projectId = this.configStore.get(CONFIG_KEYS.PROJECT_ID) as string | undefined;
    const projectName = this.configStore.get(CONFIG_KEYS.PROJECT_NAME) as string | undefined;
    const authMode = this.configStore.get(CONFIG_KEYS.AUTH_MODE) as AuthMode | undefined;
    const cloneRoot = this.configStore.get(CONFIG_KEYS.CLONE_ROOT) as string | undefined;

    if (!orgUrl || !projectId || !projectName || !authMode || !cloneRoot) {
      throw new MissingConfigError();
    }

    return { orgUrl, projectId, projectName, authMode, cloneRoot };
  }
}

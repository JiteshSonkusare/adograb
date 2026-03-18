import { AuthMode } from '../../domain/value-objects/auth-mode.vo';

export interface AppConfigDto {
  orgUrl: string;
  projectId: string;
  projectName: string;
  authMode: AuthMode;
  cloneRoot: string;
}

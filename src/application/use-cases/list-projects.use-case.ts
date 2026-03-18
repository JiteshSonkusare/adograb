import { IAdoClient } from '../ports/ado-client.port';
import { IAuthHeaderProvider } from '../ports/auth-provider.port';
import { ProjectDto } from '../dto/project.dto';

export interface ListProjectsInput {
  orgUrl: string;
}

export class ListProjectsUseCase {
  constructor(
    private readonly adoClient: IAdoClient,
    private readonly authProvider: IAuthHeaderProvider
  ) {}

  async execute(input: ListProjectsInput): Promise<ProjectDto[]> {
    const authHeader = await this.authProvider.getAuthHeader();
    return this.adoClient.getProjects(input.orgUrl, authHeader);
  }
}

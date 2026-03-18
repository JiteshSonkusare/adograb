import { IAdoClient } from '../ports/ado-client.port';
import { IAuthHeaderProvider } from '../ports/auth-provider.port';
import { RepositoryDto } from '../dto/repository.dto';

export interface ListRepositoriesInput {
  orgUrl: string;
  projectId: string;
}

export class ListRepositoriesUseCase {
  constructor(
    private readonly adoClient: IAdoClient,
    private readonly authProvider: IAuthHeaderProvider
  ) {}

  async execute(input: ListRepositoriesInput): Promise<RepositoryDto[]> {
    const authHeader = await this.authProvider.getAuthHeader();
    return this.adoClient.getRepositories(input.orgUrl, input.projectId, authHeader);
  }
}

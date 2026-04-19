import { IAdoClient } from '../ports/ado-client.port';
import { IAuthHeaderProvider } from '../ports/auth-provider.port';
import { IGitService } from '../ports/git-service.port';
import { ISecretStore } from '../ports/secret-store.port';
import { RepositoryDto } from '../dto/repository.dto';
import { RepositoryNotFoundError } from '../errors/app-errors';
import { KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT } from '../../shared/constants/app.constants';
import path from 'path';
import fs from 'fs';

export interface CloneRepositoryInput {
  orgUrl: string;
  projectId: string;
  repoName: string;
  cloneRoot: string;
  authMode: 'default' | 'pat';
}

export interface CloneRepositoryResult {
  repository: RepositoryDto;
  clonedTo: string;
  alreadyExisted: boolean;
}

export class CloneRepositoryUseCase {
  constructor(
    private readonly adoClient: IAdoClient,
    private readonly authProvider: IAuthHeaderProvider,
    private readonly gitService: IGitService,
    private readonly secretStore: ISecretStore
  ) {}

  async execute(input: CloneRepositoryInput): Promise<CloneRepositoryResult> {
    const authHeader = await this.authProvider.getAuthHeader();

    const repository = await this.adoClient.getRepositoryByName(
      input.orgUrl,
      input.projectId,
      input.repoName,
      authHeader
    );

    if (!repository) {
      throw new RepositoryNotFoundError(input.repoName);
    }

    const targetPath = path.join(input.cloneRoot, repository.name);

    if (fs.existsSync(targetPath)) {
      return { repository, clonedTo: targetPath, alreadyExisted: true };
    }

    let pat: string | undefined;
    if (input.authMode === 'pat') {
      const stored = await this.secretStore.getSecret(KEYTAR_SERVICE, KEYTAR_ACCOUNT_PAT);
      if (stored) {
        pat = stored;
      }
    }

    await this.gitService.clone({
      cloneUrl: repository.remoteUrl,
      targetPath,
      pat,
    });

    return { repository, clonedTo: targetPath, alreadyExisted: false };
  }
}

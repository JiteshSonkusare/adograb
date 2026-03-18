import { ProjectDto } from '../dto/project.dto';
import { RepositoryDto } from '../dto/repository.dto';

export interface IAdoClient {
  getProjects(orgUrl: string, authHeader: string): Promise<ProjectDto[]>;
  getRepositories(
    orgUrl: string,
    projectId: string,
    authHeader: string
  ): Promise<RepositoryDto[]>;
  getRepositoryByName(
    orgUrl: string,
    projectId: string,
    repoName: string,
    authHeader: string
  ): Promise<RepositoryDto>;
}

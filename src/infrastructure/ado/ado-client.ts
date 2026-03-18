import axios from 'axios';
import { IAdoClient } from '../../application/ports/ado-client.port';
import { ProjectDto } from '../../application/dto/project.dto';
import { RepositoryDto } from '../../application/dto/repository.dto';
import {
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  ProjectFetchError,
  RepositoryFetchError,
  RepositoryNotFoundError,
} from '../../application/errors/app-errors';
import { ADO_API_VERSION } from '../../shared/constants/app.constants';
import { normalizeOrgUrl } from '../../shared/utils/url.utils';

interface AdoProjectsResponse {
  value: AdoProject[];
  count: number;
}

interface AdoProject {
  id: string;
  name: string;
  description?: string;
  state: string;
  visibility: string;
}

interface AdoRepositoriesResponse {
  value: AdoRepository[];
  count: number;
}

interface AdoRepository {
  id: string;
  name: string;
  remoteUrl: string;
  sshUrl?: string;
  webUrl?: string;
  defaultBranch?: string;
  project: { id: string; name: string };
}

export class AdoClient implements IAdoClient {
  async getProjects(orgUrl: string, authHeader: string): Promise<ProjectDto[]> {
    const url =
      `${normalizeOrgUrl(orgUrl)}/_apis/projects` +
      `?api-version=${ADO_API_VERSION}&stateFilter=wellFormed`;
    try {
      const response = await axios.get<AdoProjectsResponse>(url, {
        headers: { Authorization: authHeader },
      });
      return response.data.value.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        state: p.state,
        visibility: p.visibility,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) throw new AuthenticationError();
        if (status === 403) throw new AuthorizationError();
        if (!error.response) throw new NetworkError(undefined, error);
      }
      throw new ProjectFetchError(
        `Failed to fetch projects: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  async getRepositories(
    orgUrl: string,
    projectId: string,
    authHeader: string
  ): Promise<RepositoryDto[]> {
    const url =
      `${normalizeOrgUrl(orgUrl)}/${projectId}/_apis/git/repositories` +
      `?api-version=${ADO_API_VERSION}`;
    try {
      const response = await axios.get<AdoRepositoriesResponse>(url, {
        headers: { Authorization: authHeader },
      });
      return response.data.value.map((r) => ({
        id: r.id,
        name: r.name,
        remoteUrl: r.remoteUrl,
        sshUrl: r.sshUrl,
        webUrl: r.webUrl,
        defaultBranch: r.defaultBranch,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) throw new AuthenticationError();
        if (status === 403) throw new AuthorizationError();
        if (!error.response) throw new NetworkError(undefined, error);
      }
      throw new RepositoryFetchError(
        `Failed to fetch repositories: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  async getRepositoryByName(
    orgUrl: string,
    projectId: string,
    repoName: string,
    authHeader: string
  ): Promise<RepositoryDto> {
    const repos = await this.getRepositories(orgUrl, projectId, authHeader);
    const repo = repos.find((r) => r.name.toLowerCase() === repoName.toLowerCase());
    if (!repo) throw new RepositoryNotFoundError(repoName);
    return repo;
  }
}

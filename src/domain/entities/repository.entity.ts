export interface RepositoryEntity {
  id: string;
  name: string;
  remoteUrl: string;
  sshUrl?: string;
  webUrl?: string;
  defaultBranch?: string;
  projectId: string;
  projectName: string;
}

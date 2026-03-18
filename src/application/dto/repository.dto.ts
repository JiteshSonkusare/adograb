export interface RepositoryDto {
  id: string;
  name: string;
  remoteUrl: string;
  sshUrl?: string;
  webUrl?: string;
  defaultBranch?: string;
}

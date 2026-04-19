export interface CloneOptions {
  cloneUrl: string;
  targetPath: string;
  pat?: string;
}

export interface GitStatusResult {
  isDirty: boolean;
  currentBranch: string;
}

export interface IGitService {
  clone(options: CloneOptions): Promise<void>;
  pull(repoPath: string): Promise<void>;
  getStatus(repoPath: string): Promise<GitStatusResult>;
}

export interface CloneOptions {
  cloneUrl: string;
  targetPath: string;
  pat?: string;
}

export interface IGitService {
  clone(options: CloneOptions): Promise<void>;
}

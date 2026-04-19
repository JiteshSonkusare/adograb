import { spawn } from 'child_process';
import { DetectedIde } from './ide-detector';

export function launchIde(ide: DetectedIde, repoPath: string): void {
  const child = spawn(ide.command, [repoPath], {
    detached: true,
    stdio: 'ignore',
    shell: true,
  });
  child.unref();
}

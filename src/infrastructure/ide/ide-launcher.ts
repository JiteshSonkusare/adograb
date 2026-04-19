import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { DetectedIde } from './ide-detector';

export interface LaunchResult {
  launched: boolean;
  reason?: string;
}

function findSolutionFile(repoPath: string): string | null {
  try {
    const files = fs.readdirSync(repoPath, { recursive: true, encoding: 'utf8' }) as string[];
    const sln = files.find(
      (f) => typeof f === 'string' && (f.endsWith('.sln') || f.endsWith('.slnx'))
    );
    return sln ? path.join(repoPath, sln) : null;
  } catch {
    return null;
  }
}

export function launchIde(ide: DetectedIde, repoPath: string): LaunchResult {
  let target = repoPath;

  if (ide.id === 'visualstudio') {
    const sln = findSolutionFile(repoPath);
    if (!sln) {
      return {
        launched: false,
        reason: 'No .sln or .slnx file found. Cannot open in Visual Studio.',
      };
    }
    target = sln;
  }

  const child =
    process.platform === 'win32'
      ? // cmd.exe /c is the correct way to invoke .cmd launchers (code.cmd, cursor.cmd, etc.)
        // from Node.js. spawn handles argument quoting via CreateProcess, so paths with spaces work.
        // detached:true + windowsHide:true prevents a flash and keeps VS Code alive after CLI exits.
        spawn('cmd.exe', ['/c', ide.command, target], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true,
          })
      : spawn(ide.command, [target], { detached: true, stdio: 'ignore' });

  child.unref();
  return { launched: true };
}

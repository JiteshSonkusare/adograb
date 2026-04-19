import { execa } from 'execa';
import fs from 'fs';

export interface DetectedIde {
  id: string;
  label: string;
  command: string;
}

const VSWHERE_PATH =
  'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe';

async function resolveCommandPath(command: string): Promise<string | null> {
  try {
    const checker = process.platform === 'win32' ? 'where' : 'which';
    const result = await execa(checker, [command], { stdio: 'pipe' });
    const firstPath = result.stdout.trim().split(/\r?\n/)[0]?.trim();
    return firstPath || null;
  } catch {
    return null;
  }
}

async function findVisualStudioDevenv(): Promise<string | null> {
  if (process.platform !== 'win32') return null;
  if (!fs.existsSync(VSWHERE_PATH)) return null;

  try {
    const result = await execa(
      VSWHERE_PATH,
      ['-latest', '-requires', 'Microsoft.Component.MSBuild', '-find', 'Common7\\IDE\\devenv.exe'],
      { stdio: 'pipe' }
    );
    const devenvPath = result.stdout.trim().split('\n')[0]?.trim();
    return devenvPath && fs.existsSync(devenvPath) ? devenvPath : null;
  } catch {
    return null;
  }
}

export async function detectInstalledIdes(): Promise<DetectedIde[]> {
  const [vsCodePath, cursorPath, devenvPath, riderPath, webstormPath, ideaPath] = await Promise.all([
    resolveCommandPath('code'),
    resolveCommandPath('cursor'),
    findVisualStudioDevenv(),
    resolveCommandPath('rider'),
    resolveCommandPath('webstorm'),
    resolveCommandPath('idea'),
  ]);

  const ides: DetectedIde[] = [];

  // VS Code is always listed first when available
  if (vsCodePath) ides.push({ id: 'vscode', label: 'VS Code', command: vsCodePath });
  if (cursorPath) ides.push({ id: 'cursor', label: 'Cursor', command: cursorPath });
  if (devenvPath) ides.push({ id: 'visualstudio', label: 'Visual Studio', command: devenvPath });
  if (riderPath) ides.push({ id: 'rider', label: 'Rider', command: riderPath });
  if (webstormPath) ides.push({ id: 'webstorm', label: 'WebStorm', command: webstormPath });
  if (ideaPath) ides.push({ id: 'idea', label: 'IntelliJ IDEA', command: ideaPath });

  return ides;
}

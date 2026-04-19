import { execa } from 'execa';
import fs from 'fs';

export interface DetectedIde {
  id: string;
  label: string;
  command: string;
}

const VSWHERE_PATH =
  'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe';

async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    const checker = process.platform === 'win32' ? 'where' : 'which';
    await execa(checker, [command], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
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
  const [vsCode, cursor, devenvPath, rider, webstorm, idea] = await Promise.all([
    isCommandAvailable('code'),
    isCommandAvailable('cursor'),
    findVisualStudioDevenv(),
    isCommandAvailable('rider'),
    isCommandAvailable('webstorm'),
    isCommandAvailable('idea'),
  ]);

  const ides: DetectedIde[] = [];

  // VS Code is always listed first when available
  if (vsCode) ides.push({ id: 'vscode', label: 'VS Code', command: 'code' });
  if (cursor) ides.push({ id: 'cursor', label: 'Cursor', command: 'cursor' });
  if (devenvPath) ides.push({ id: 'visualstudio', label: 'Visual Studio', command: devenvPath });
  if (rider) ides.push({ id: 'rider', label: 'Rider', command: 'rider' });
  if (webstorm) ides.push({ id: 'webstorm', label: 'WebStorm', command: 'webstorm' });
  if (idea) ides.push({ id: 'idea', label: 'IntelliJ IDEA', command: 'idea' });

  return ides;
}

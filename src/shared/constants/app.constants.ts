export const APP_NAME = 'adograb';
export const APP_VERSION = '0.1.0';

export const KEYTAR_SERVICE = 'adograb';
export const KEYTAR_ACCOUNT_PAT = 'pat';

export const ADO_API_VERSION = '7.1';

export const CONFIG_KEYS = {
  ORG_URL: 'orgUrl',
  PROJECT_ID: 'projectId',
  PROJECT_NAME: 'projectName',
  AUTH_MODE: 'authMode',
  CLONE_ROOT: 'cloneRoot',
} as const;

export type ConfigKey = (typeof CONFIG_KEYS)[keyof typeof CONFIG_KEYS];

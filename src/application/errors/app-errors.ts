export enum AppErrorCode {
  MISSING_CONFIG = 'MISSING_CONFIG',
  INVALID_ORG_URL = 'INVALID_ORG_URL',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  PROJECT_FETCH_FAILED = 'PROJECT_FETCH_FAILED',
  REPOSITORY_FETCH_FAILED = 'REPOSITORY_FETCH_FAILED',
  REPOSITORY_NOT_FOUND = 'REPOSITORY_NOT_FOUND',
  CLONE_FAILED = 'CLONE_FAILED',
  SECURE_STORE_FAILED = 'SECURE_STORE_FAILED',
  CONFIG_PERSISTENCE_FAILED = 'CONFIG_PERSISTENCE_FAILED',
  NETWORK_FAILED = 'NETWORK_FAILED',
}

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class MissingConfigError extends AppError {
  constructor(
    message = 'Configuration not found. Run `adograb init` to set up the tool.'
  ) {
    super(AppErrorCode.MISSING_CONFIG, message);
    this.name = 'MissingConfigError';
  }
}

export class InvalidOrgUrlError extends AppError {
  constructor(message: string) {
    super(AppErrorCode.INVALID_ORG_URL, message);
    this.name = 'InvalidOrgUrlError';
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message = 'Authentication failed. Check your credentials or run `adograb auth switch`.'
  ) {
    super(AppErrorCode.AUTHENTICATION_FAILED, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message = 'Access denied. You do not have permission to access this resource.'
  ) {
    super(AppErrorCode.AUTHORIZATION_FAILED, message);
    this.name = 'AuthorizationError';
  }
}

export class ProjectFetchError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(AppErrorCode.PROJECT_FETCH_FAILED, message, cause);
    this.name = 'ProjectFetchError';
  }
}

export class RepositoryFetchError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(AppErrorCode.REPOSITORY_FETCH_FAILED, message, cause);
    this.name = 'RepositoryFetchError';
  }
}

export class RepositoryNotFoundError extends AppError {
  constructor(repoName: string) {
    super(
      AppErrorCode.REPOSITORY_NOT_FOUND,
      `Repository "${repoName}" was not found in the selected project.`
    );
    this.name = 'RepositoryNotFoundError';
  }
}

export class CloneError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(AppErrorCode.CLONE_FAILED, message, cause);
    this.name = 'CloneError';
  }
}

export class SecureStoreError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(AppErrorCode.SECURE_STORE_FAILED, message, cause);
    this.name = 'SecureStoreError';
  }
}

export class ConfigPersistenceError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(AppErrorCode.CONFIG_PERSISTENCE_FAILED, message, cause);
    this.name = 'ConfigPersistenceError';
  }
}

export class NetworkError extends AppError {
  constructor(
    message = 'Network request failed. Check your internet connection.',
    cause?: unknown
  ) {
    super(AppErrorCode.NETWORK_FAILED, message, cause);
    this.name = 'NetworkError';
  }
}

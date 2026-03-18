export const AUTH_MODES = ['default', 'pat'] as const;
export type AuthMode = (typeof AUTH_MODES)[number];

export function isValidAuthMode(value: string): value is AuthMode {
  return (AUTH_MODES as readonly string[]).includes(value);
}

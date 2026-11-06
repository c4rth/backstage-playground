export function createHeaders(): Headers {
  return new Headers({ Accept: 'application/json' });
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

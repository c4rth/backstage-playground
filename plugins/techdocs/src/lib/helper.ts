export function extractUrl(url: string | undefined): string {
  if (url?.startsWith('external:')) {
    return url.substring('external:'.length);
  }
  return url || '';
}

export function isExternalUrl(url: string | undefined): boolean {
  return url?.startsWith('external:') || false;
}

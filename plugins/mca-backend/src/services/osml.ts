import {
  NotFoundError,
  ServiceUnavailableError,
} from '@backstage/errors';

function buildQueryParams(
  params: Record<string, string | number | undefined>,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}

async function fetchOctetStreamAsText(url: URL): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new ServiceUnavailableError(
      'Failed to fetch component definition',
      error,
    );
  }
  if (response.status === 404) {
    throw new NotFoundError(`Component definition not found at ${url}`);
  }
  if (!response.ok) {
    throw new ServiceUnavailableError(
      `Failed to fetch component definition: HTTP ${response.status} ${response.statusText}`,
    );
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await response.arrayBuffer();
  } catch (error) {
    throw new ServiceUnavailableError(
      'Failed to read component definition response',
      error,
    );
  }
  const charset = response.headers
    .get('content-type')
    ?.match(/charset=([\w-]+)/i)?.[1];
  if (charset) {
    try {
      return new TextDecoder(charset).decode(buffer);
    } catch {
      // Unknown charset labels fall back to UTF-8.
    }
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('windows-1252').decode(buffer);
  }
}

export async function getMcaXmlData(
  baseUrl: string,
  component: string,
  refP: string,
): Promise<string> {
  const extension = component.startsWith('Operation') ? 'osml' : 'esml';
  const encodedComponent = encodeURIComponent(component.trim());
  const encodedRefP = encodeURIComponent(
    refP.trim().replace(/^P/, '').replace(/^0+/, ''),
  );

  const searchParams = buildQueryParams({
    env: 'TST',
    myCurrentP: encodedRefP,
  });

  const url = new URL(`${baseUrl}/${encodedComponent}.${extension}`);
  url.search = searchParams.toString();

  return fetchOctetStreamAsText(url);
}

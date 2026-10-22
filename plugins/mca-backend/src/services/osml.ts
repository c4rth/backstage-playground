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
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const charset = response.headers
      .get('content-type')
      ?.match(/charset=([\w-]+)/i)?.[1];
    if (charset) {
      try {
        return new TextDecoder(charset).decode(buffer);
      } catch {
        /* unknown label — fall through */
      }
    }

    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
      return new TextDecoder('windows-1252').decode(buffer);
    }
  } catch (error) {
    throw error;
  }
}

export async function getMcaXmlData(
  baseUrl: string,
  component: string,
  refP: string,
): Promise<string> {
  try {
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

    return await fetchOctetStreamAsText(url);
  } catch (error) {
    throw error;
  }
}

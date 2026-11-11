import { mockApis } from '@backstage/frontend-test-utils';
import { ApiPlatformBackendClient } from './ApiPlatformBackendApi';

function createClient() {
  const fetchApi = mockApis.fetch.mock();
  const client = new ApiPlatformBackendClient({
    discoveryApi: mockApis.discovery(),
    fetchApi,
    translationApi: mockApis.translation(),
  });
  return { client, fetchApi };
}

it('preserves API, service, system and library validation messages', async () => {
  const { client, fetchApi } = createClient();
  await expect(client.getApiVersions('DEMO', '')).rejects.toThrow(
    'API name is required',
  );
  await expect(client.getServiceVersions('', 'service')).rejects.toThrow(
    "System and service name are required : '' 'service'",
  );
  await expect(client.getSystem('')).rejects.toThrow('System name is required');
  await expect(client.getLibraryVersions('DEMO', '', true)).rejects.toThrow(
    'Library name is required',
  );
  expect(fetchApi.fetch).not.toHaveBeenCalled();
});

it.each([
  [
    'unregisterEntity',
    'DELETE',
    'Failed to unregister entity: HTTP 503 - Unavailable',
  ],
  [
    'refreshEntity',
    'PATCH',
    'Failed to refresh entity: HTTP 503 - Unavailable',
  ],
] as const)(
  'preserves %s errors and request methods',
  async (operation, method, message) => {
    const { client, fetchApi } = createClient();
    fetchApi.fetch.mockResolvedValue(
      new Response('', { status: 503, statusText: 'Unavailable' }),
    );
    await expect(client[operation]('component', 'raw-name')).rejects.toThrow(
      message,
    );
    expect(fetchApi.fetch).toHaveBeenCalledWith(expect.any(URL), { method });
    const url = fetchApi.fetch.mock.calls[0][0];
    expect(String(url)).toContain('/catalog/component/raw-name');
  },
);

it('leaves raw HTTP diagnostics untouched', async () => {
  const { client, fetchApi } = createClient();
  fetchApi.fetch.mockResolvedValue(
    new Response('', { status: 502, statusText: 'Bad Gateway' }),
  );
  await expect(
    client.listApis({ ownershipType: 'all', apiType: 'all' }),
  ).rejects.toThrow('HTTP 502: Bad Gateway');
});

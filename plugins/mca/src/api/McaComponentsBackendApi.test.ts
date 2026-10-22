import { McaComponentsBackendClient } from './McaComponentsBackendApi';

describe('McaComponentsBackendClient', () => {
  const fetch = jest.fn();
  const client = new McaComponentsBackendClient({
    discoveryApi: {
      getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7007/api/mca'),
    },
    fetchApi: { fetch },
  });

  beforeEach(() => {
    fetch.mockReset();
  });

  it.each([
    ['Xyz', 'P123'],
    [' Xyz/Abc ', 'P123&other=value'],
  ])('requests the definition endpoint for %s', async (component, refP) => {
    const definition = '<definition />';
    fetch.mockResolvedValue({
      ok: true,
      text: async () => definition,
    });

    await expect(
      client.getMcaComponentDefinition(component, refP),
    ).resolves.toBe(definition);

    expect(fetch).toHaveBeenCalledTimes(1);
    const url = fetch.mock.calls[0][0] as URL;
    expect(url.pathname).toBe(
      `/api/mca/mca/components/${encodeURIComponent(component.trim())}/definition`,
    );
    expect([...url.searchParams.entries()]).toEqual([['refP', refP]]);
  });
});

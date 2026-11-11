import { FeatureFlagsApi, FetchApi } from '@backstage/core-plugin-api';
import { dummyCallV1 } from './fake-data-v1';
import nonPrdFixture from './fake-data-v1-nonprd.json';
import prdFixture from './fake-data-v1-prd.json';
import { fetchHealthV1Data } from './health-v1';
import { mockApis } from '@backstage/frontend-test-utils';
import { healthDashboardTranslationRef } from '../translation';

const translation = mockApis.translation().getTranslation(healthDashboardTranslationRef);
if (!translation.ready) {
  throw new Error('Test translations are not ready');
}

describe('fetchHealthV1Data', () => {
  const fetchApi: jest.Mocked<FetchApi> = { fetch: jest.fn() };
  const featureFlagsApi: jest.Mocked<FeatureFlagsApi> = {
    isActive: jest.fn(),
    registerFlag: jest.fn(),
    getRegisteredFlags: jest.fn(),
    save: jest.fn(),
  };
  const options = {
    endpointPath: '/health-probes-v1-prd',
    baseUrl: 'https://backstage.example.com',
    fetchApi,
    featureFlagsApi,
    t: translation.t,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([true, false])('returns a JSON response for prd=%s', async prd => {
    const response = dummyCallV1(prd);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual(prd ? prdFixture : nonPrdFixture);
  });

  it.each([
    ['/health-probes-v1-prd', prdFixture],
    ['/health-probes-v1-nonprd', nonPrdFixture],
    ['/health-probes-v1-PRD', prdFixture],
    ['/health-probes-v1-NONPRD', nonPrdFixture],
  ])(
    'parses and transforms mock and live JSON identically for %s',
    async (endpointPath, fixture) => {
      const parse = jest.spyOn(Response.prototype, 'json');
      featureFlagsApi.isActive.mockReturnValue(true);
      const mockData = await fetchHealthV1Data({ ...options, endpointPath });

      expect(featureFlagsApi.isActive).toHaveBeenCalledWith(
        'mock-health-dashboard',
      );
      expect(fetchApi.fetch).not.toHaveBeenCalled();
      expect(mockData.map(row => row.application)).toEqual(
        [...new Set(Object.values(fixture).flatMap(Object.keys))].sort(),
      );
      for (const [environment, applications] of Object.entries(fixture)) {
        for (const [application, probe] of Object.entries(applications)) {
          expect(
            mockData.find(row => row.application === application)?.environments[
              environment
            ],
          ).toEqual(probe);
        }
      }

      featureFlagsApi.isActive.mockReturnValue(false);
      fetchApi.fetch.mockResolvedValue(
        new Response(JSON.stringify(fixture), {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      expect(await fetchHealthV1Data({ ...options, endpointPath })).toEqual(
        mockData,
      );
      expect(parse).toHaveBeenCalledTimes(2);
      expect(fetchApi.fetch).toHaveBeenCalledWith(
        new URL(`${options.baseUrl}/api/proxy${endpointPath}`),
        { method: 'GET', headers: new Headers({ Accept: 'application/json' }) },
      );
    },
  );

  it('parses fresh data for each mock call', async () => {
    featureFlagsApi.isActive.mockReturnValue(true);
    const first = await fetchHealthV1Data(options);
    const second = await fetchHealthV1Data(options);

    expect(first).toEqual(second);
    expect(first[0].environments.prd).not.toBe(second[0].environments.prd);
  });

  it('preserves HTTP error reporting for live data', async () => {
    featureFlagsApi.isActive.mockReturnValue(false);
    fetchApi.fetch.mockResolvedValue(
      new Response('Unavailable', { status: 503 }),
    );

    await expect(fetchHealthV1Data(options)).rejects.toThrow(
      'Failed to get health data: HTTP 503: Failed to fetch health data - Unavailable',
    );
  });

  it('reports invalid JSON instead of returning empty data', async () => {
    featureFlagsApi.isActive.mockReturnValue(false);
    fetchApi.fetch.mockResolvedValue(new Response('invalid JSON'));

    await expect(fetchHealthV1Data(options)).rejects.toThrow(
      'Failed to get health data:',
    );
  });

  it('preserves validation of empty live data', async () => {
    featureFlagsApi.isActive.mockReturnValue(false);
    fetchApi.fetch.mockResolvedValue(new Response('null'));

    await expect(fetchHealthV1Data(options)).rejects.toThrow(
      'Failed to get health data: Invalid response: expected health data object',
    );
  });
});

import { FeatureFlagsApi, FetchApi } from '@backstage/core-plugin-api';
import { buildHealthMatrix } from '../components/HealthDashboardV2Page/healthMatrix';
import { HealthV2Data } from '../types';
import { dummyCallV2 } from './fake-data-v2';
import fixtureData from './fake-data-v2.json';
import v1Fixture from './fake-data-v1-prd.json';
import { fetchHealthV2Data } from './health-v2';
import { mockApis } from '@backstage/frontend-test-utils';
import { healthDashboardTranslationRef } from '../translation';

const fixture: HealthV2Data = fixtureData;
const translation = mockApis.translation().getTranslation(healthDashboardTranslationRef);
if (!translation.ready) {
  throw new Error('Test translations are not ready');
}

describe('fetchHealthV2Data', () => {
  const fetchApi: jest.Mocked<FetchApi> = { fetch: jest.fn() };
  const featureFlagsApi: jest.Mocked<FeatureFlagsApi> = {
    isActive: jest.fn(),
    registerFlag: jest.fn(),
    getRegisteredFlags: jest.fn(),
    save: jest.fn(),
  };
  const options = {
    endpointPath: '/health-probes-v2',
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

  it('returns populated mock data without fetching when the flag is active', async () => {
    featureFlagsApi.isActive.mockReturnValue(true);

    const data = await fetchHealthV2Data(options);

    expect(featureFlagsApi.isActive).toHaveBeenCalledWith(
      'mock-health-dashboard',
    );
    expect(fetchApi.fetch).not.toHaveBeenCalled();
    expect(Object.keys(data)).toEqual(['PRD', 'PTP', 'UAT', 'GTU', 'TST']);
    const rows = buildHealthMatrix(data, []);
    expect(rows).toHaveLength(31);
    expect(rows.some(row => Object.keys(row.environments).length < 5)).toBe(
      true,
    );
    for (const row of rows) {
      for (const [environment, probes] of Object.entries(row.environments)) {
        expect(probes).toHaveLength(1);
        for (const probe of probes) {
          expect(probe).toEqual(
            expect.objectContaining({
              application: row.application,
              component: row.component,
              environment,
              timestamp: expect.any(String),
              executionTime: expect.any(Number),
              healthProbeUrl: expect.stringMatching(/^https:\/\//),
            }),
          );
        }
      }
    }
  });

  it('uses each probe object key as its component name', () => {
    for (const groups of Object.values(fixture)) {
      for (const probes of Object.values(groups)) {
        for (const [name, probe] of Object.entries(probes)) {
          expect(probe.component).toBe(name);
        }
      }
    }
  });

  it('only includes the ten v1 sample application codes', () => {
    const applications = new Set(
      Object.values(fixture).flatMap(groups => Object.keys(groups)),
    );
    expect(applications).toEqual(new Set(Object.keys(v1Fixture.prd)));
    expect(JSON.stringify(fixture)).not.toMatch(/s\d{3}/i);
  });

  it('returns a JSON response containing all sample status variants', async () => {
    const response = dummyCallV2();
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual(fixture);
    const statuses = Object.values(fixture).flatMap(groups =>
      Object.values(groups).flatMap(probes =>
        Object.values(probes).map(probe => probe.technicalStatus),
      ),
    );
    expect(new Set(statuses)).toEqual(new Set(['GREEN', 'RED']));
  });

  it('covers endpoint-style payloads, platforms, statuses, and nullable metadata', () => {
    const probes = Object.values(fixture).flatMap(groups =>
      Object.values(groups).flatMap(Object.values),
    );
    expect(probes).toHaveLength(49);
    expect(new Set(probes.map(probe => probe.httpStatusCode))).toEqual(
      new Set([0, 200, 404, 503]),
    );
    expect(new Set(probes.map(probe => probe.functionalStatus))).toEqual(
      new Set(['GREEN', 'RED', 'GRAY']),
    );
    expect(new Set(probes.map(probe => probe.downstreamStatus))).toEqual(
      new Set(['GREEN', 'GRAY']),
    );
    expect(new Set(probes.map(probe => probe.applicationType))).toEqual(
      new Set(['compv2', 'Front']),
    );
    expect(probes.some(probe => probe.response === null)).toBe(true);
    expect(probes.some(probe => probe.platformComponent === null)).toBe(true);
    expect(probes.every(probe => probe.platformService === null)).toBe(true);
    expect(probes.every(probe => probe.region === 'NE')).toBe(true);
    expect(probes.every(probe => probe.akscluster === null)).toBe(true);
    expect(
      probes.some(
        probe =>
          probe.httpStatusCode === 0 &&
          probe.response?.includes('timed out') &&
          probe.technicalStatus === 'RED',
      ),
    ).toBe(true);

    const payloads = probes
      .map(probe => probe.response)
      .filter(
        (response): response is string => response?.startsWith('{') === true,
      )
      .map(response => JSON.parse(response));
    for (const field of ['technicalHealth', 'statusDetails']) {
      expect(payloads.some(payload => field in payload)).toBe(true);
    }

    for (const [environment, groups] of Object.entries(fixture)) {
      for (const [application, components] of Object.entries(groups)) {
        for (const probe of Object.values(components)) {
          expect(probe.application).toBe(application);
          expect(probe.environment).toBe(environment);
          expect(new URL(probe.healthProbeUrl).hostname).toMatch(
            /\.example\.com$/,
          );
        }
      }
    }
  });

  it('parses fresh data for each mock call', async () => {
    featureFlagsApi.isActive.mockReturnValue(true);
    const first = await fetchHealthV2Data(options);
    const second = await fetchHealthV2Data(options);
    expect(first).toEqual(second);
    expect(first.PRD.A7K2['a7k2-api-1']).not.toBe(
      second.PRD.A7K2['a7k2-api-1'],
    );
  });

  it('parses and transforms mock and live JSON identically', async () => {
    const parse = jest.spyOn(Response.prototype, 'json');
    featureFlagsApi.isActive.mockReturnValue(true);
    const mockData = await fetchHealthV2Data(options);
    featureFlagsApi.isActive.mockReturnValue(false);
    fetchApi.fetch.mockResolvedValue(
      new Response(JSON.stringify(fixture), {
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(await fetchHealthV2Data(options)).toEqual(mockData);
    expect(parse).toHaveBeenCalledTimes(2);
  });

  it('fetches and sorts live data when the flag is inactive', async () => {
    featureFlagsApi.isActive.mockReturnValue(false);
    const data = fixture;
    fetchApi.fetch.mockResolvedValue(
      new Response(JSON.stringify({ LAB: {}, ...data }), { status: 200 }),
    );

    const result = await fetchHealthV2Data(options);

    expect(fetchApi.fetch).toHaveBeenCalledWith(
      new URL('https://backstage.example.com/api/proxy/health-probes-v2'),
      { method: 'GET', headers: new Headers({ Accept: 'application/json' }) },
    );
    expect(Object.keys(result)).toEqual([
      'PRD',
      'PTP',
      'UAT',
      'GTU',
      'TST',
      'LAB',
    ]);
    expect(result).toEqual({ LAB: {}, ...data });
  });

  it('preserves HTTP error reporting for live data', async () => {
    featureFlagsApi.isActive.mockReturnValue(false);
    fetchApi.fetch.mockResolvedValue(
      new Response('Unavailable', { status: 503 }),
    );

    await expect(fetchHealthV2Data(options)).rejects.toThrow(
      'Failed to get health data: HTTP 503: Failed to fetch health data - Unavailable',
    );
  });

  it('reports invalid JSON instead of returning empty data', async () => {
    featureFlagsApi.isActive.mockReturnValue(false);
    fetchApi.fetch.mockResolvedValue(new Response('invalid JSON'));

    await expect(fetchHealthV2Data(options)).rejects.toThrow(
      'Failed to get health data:',
    );
  });
});

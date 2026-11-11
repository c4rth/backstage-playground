import { FeatureFlagsApi, FetchApi } from '@backstage/core-plugin-api';
import {
  ApplicationHealthV1Data,
  EnvironmentHealthV1Data,
  HealthV1Data,
  HealthV1Probe,
} from '../types';
import { dummyCallV1 } from './fake-data-v1';
import { createHeaders, toErrorMessage } from './utils';
import { HealthDashboardTranslator } from '../translation';

function sortHealthDataByApplication(
  data: EnvironmentHealthV1Data,
): HealthV1Data {
  const applicationsByName = new Map<string, Record<string, HealthV1Probe>>();
  Object.entries(data).forEach(([environment, applications]) => {
    Object.entries(applications).forEach(([application, probe]) => {
      const existingEnvironments = applicationsByName.get(application) ?? {};
      existingEnvironments[environment] = probe;
      applicationsByName.set(application, existingEnvironments);
    });
  });

  return Array.from(applicationsByName.entries())
    .sort(([leftApplication], [rightApplication]) =>
      leftApplication.localeCompare(rightApplication, undefined, {
        sensitivity: 'base',
      }),
    )
    .map(([application, environments]): ApplicationHealthV1Data => ({
      application,
      environments,
    }));
}

export async function fetchHealthV1Data(options: {
  endpointPath: string;
  baseUrl: string;
  fetchApi: FetchApi;
  featureFlagsApi: FeatureFlagsApi;
  t: HealthDashboardTranslator;
}): Promise<HealthV1Data> {
  const { endpointPath, baseUrl, fetchApi, featureFlagsApi, t } = options;

  try {
    let response: Response;

    if (featureFlagsApi.isActive('mock-health-dashboard')) {
      const isPrdProbe =
        endpointPath.toLowerCase().includes('prd') &&
        !endpointPath.toLowerCase().includes('nonprd');
      response = dummyCallV1(isPrdProbe);
    } else {
      const url = new URL(`${baseUrl}/api/proxy${endpointPath}`);
      response = await fetchApi.fetch(url, {
        method: 'GET',
        headers: createHeaders(),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        t('api.errors.http', {
          status: String(response.status),
          error: errorText,
        }),
      );
    }

    const data = (await response.json()) as EnvironmentHealthV1Data;

    if (!data) {
      throw new Error(t('api.errors.invalidResponse'));
    }

    return sortHealthDataByApplication(data);
  } catch (error) {
    throw new Error(t('api.errors.fetch', { error: toErrorMessage(error, t) }));
  }
}

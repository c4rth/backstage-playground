import { FeatureFlagsApi, FetchApi } from '@backstage/core-plugin-api';
import { HealthV2Data } from '../types';
import { dummyCallV2 } from './fake-data-v2';
import { createHeaders, toErrorMessage } from './utils';

const ENVIRONMENT_ORDER = ['PRD', 'PTP', 'UAT', 'GTU', 'TST'];

export async function fetchHealthV2Data(options: {
  endpointPath: string;
  baseUrl: string;
  fetchApi: FetchApi;
  featureFlagsApi: FeatureFlagsApi;
}): Promise<HealthV2Data> {
  const { endpointPath, baseUrl, fetchApi, featureFlagsApi } = options;

  try {
    let response: Response;

    if (featureFlagsApi.isActive('mock-health-dashboard')) {
      response = dummyCallV2();
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
        `HTTP ${response.status}: Failed to fetch health data - ${errorText}`,
      );
    }

    const data = (await response.json()) as HealthV2Data;
    const environmentOrder = new Map(
      ENVIRONMENT_ORDER.map((environment, index) => [environment, index]),
    );

    return Object.fromEntries(
      Object.entries(data).sort(([left], [right]) => {
        const leftOrder = environmentOrder.get(left);
        const rightOrder = environmentOrder.get(right);

        if (leftOrder !== undefined && rightOrder !== undefined) {
          return leftOrder - rightOrder;
        }
        if (leftOrder !== undefined) {
          return -1;
        }
        if (rightOrder !== undefined) {
          return 1;
        }
        return 0;
      }),
    );
  } catch (error) {
    throw new Error(`Failed to get health data: ${toErrorMessage(error)}`);
  }
}

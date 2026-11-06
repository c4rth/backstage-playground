import {
  ConfigApi,
  createApiRef,
  FetchApi,
  FeatureFlagsApi,
} from '@backstage/core-plugin-api';
import {
  ApplicationHealthV1Data,
  HealthV1DataResponse,
  HealthV2Data,
  HealthV2DataResponse,
} from '../types';
import { fetchHealthV1Data } from './health-v1';
import { fetchHealthV2Data } from './health-v2';
import { toErrorMessage } from './utils';

export const healthDashboardBackendApiRef =
  createApiRef<HealthDashboardBackendApi>({
    id: 'plugin.health-dashboard.service',
  });

export interface HealthDashboardBackendApi {
  getHealthV1Data(): Promise<HealthV1DataResponse>;
  getHealthV2Data(): Promise<HealthV2DataResponse>;
}

export class HealthDashboardBackendClient implements HealthDashboardBackendApi {
  private readonly fetchApi: FetchApi;
  private readonly featureFlagsApi: FeatureFlagsApi;
  private readonly baseUrl: string;
  private readonly v1ProxyEndpoints: string[];
  private readonly v2ProxyEndpoints: string[];

  constructor(options: {
    configApi: ConfigApi;
    fetchApi: FetchApi;
    featureFlagsApi: FeatureFlagsApi;
  }) {
    this.fetchApi = options.fetchApi;
    this.featureFlagsApi = options.featureFlagsApi;
    this.baseUrl = options.configApi.getString('backend.baseUrl');
    this.v1ProxyEndpoints = options.configApi.getStringArray(
      'healthProbes.v1.proxyEndpoints',
    );
    this.v2ProxyEndpoints = options.configApi.getStringArray(
      'healthProbes.v2.proxyEndpoints',
    );
  }

  async getHealthV1Data(): Promise<HealthV1DataResponse> {
    if (this.v1ProxyEndpoints.length === 0) {
      return {
        healthData: [],
        errors: [
          {
            source: 'healthProbes.v1.proxyEndpoints',
            message: 'No v1 probe endpoints configured',
          },
        ],
      };
    }

    const results = await Promise.allSettled(
      this.v1ProxyEndpoints.map(endpointPath =>
        fetchHealthV1Data({
          endpointPath,
          baseUrl: this.baseUrl,
          fetchApi: this.fetchApi,
          featureFlagsApi: this.featureFlagsApi,
        }),
      ),
    );
    const errors: HealthV1DataResponse['errors'] = [];
    const healthDataByEndpoint = results.map((result, index) => {
      const endpointPath = this.v1ProxyEndpoints[index];

      if (result.status === 'fulfilled') {
        return result.value;
      }

      errors.push({
        source: endpointPath,
        message: toErrorMessage(result.reason),
      });
      return [];
    });

    const mergedHealthDataMap = new Map<
      string,
      ApplicationHealthV1Data['environments']
    >();

    healthDataByEndpoint.forEach(healthData => {
      healthData.forEach(appHealth => {
        const existingEnvironments =
          mergedHealthDataMap.get(appHealth.application) ?? {};

        mergedHealthDataMap.set(appHealth.application, {
          ...appHealth.environments,
          ...existingEnvironments,
        });
      });
    });

    return {
      healthData: Array.from(mergedHealthDataMap.entries()).map(
        ([application, environments]): ApplicationHealthV1Data => ({
          application,
          environments,
        }),
      ),
      errors,
    };
  }

  async getHealthV2Data(): Promise<HealthV2DataResponse> {
    if (this.v2ProxyEndpoints.length === 0) {
      return {
        healthData: {},
        errors: [
          {
            source: 'healthProbes.v2.proxyEndpoints',
            message: 'No v2 probe endpoints configured',
          },
        ],
      };
    }

    const results = await Promise.allSettled(
      this.v2ProxyEndpoints.map(endpointPath =>
        fetchHealthV2Data({
          endpointPath,
          baseUrl: this.baseUrl,
          fetchApi: this.fetchApi,
          featureFlagsApi: this.featureFlagsApi,
        }),
      ),
    );
    const errors: HealthV2DataResponse['errors'] = [];
    const healthData: HealthV2Data = {};
    results.forEach((result, index) => {
      const endpointPath = this.v2ProxyEndpoints[index];

      if (result.status === 'fulfilled') {
        Object.entries(result.value).forEach(([environment, groups]) => {
          const existingGroups = healthData[environment] ?? {};
          const mergedGroups = { ...groups, ...existingGroups };

          Object.entries(groups).forEach(([group, applications]) => {
            const existingApplications = existingGroups[group] ?? {};
            const mergedApplications = {
              ...applications,
              ...existingApplications,
            };

            Object.entries(applications).forEach(([application, probe]) => {
              mergedApplications[application] = {
                ...probe,
                ...existingApplications[application],
              };
            });

            mergedGroups[group] = mergedApplications;
          });

          healthData[environment] = mergedGroups;
        });
        return;
      }

      errors.push({
        source: endpointPath,
        message: toErrorMessage(result.reason),
      });
    });

    return {
      healthData,
      errors,
    };
  }
}

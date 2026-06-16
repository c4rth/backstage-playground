import {
  ConfigApi,
  createApiRef,
  FetchApi,
  FeatureFlagsApi,
} from '@backstage/core-plugin-api';
import {
  ApplicationHealthData,
  EnvironmentHealthData,
  HealthData,
  HealthDataResponse,
  HealthProbe,
} from '../types';
import { dummyCall } from './fake-data';

export const healthDashboardBackendApiRef =
  createApiRef<HealthDashboardBackendApi>({
    id: 'plugin.health-dashboard.service',
  });

export interface HealthDashboardBackendApi {
  getHealthData(): Promise<HealthDataResponse>;
}

export class HealthDashboardBackendClient implements HealthDashboardBackendApi {
  private readonly configApi: ConfigApi;
  private readonly fetchApi: FetchApi;
  private readonly featureFlagsApi: FeatureFlagsApi;
  private readonly baseUrl: string;
  private readonly probesUrl: string[];

  constructor(options: {
    configApi: ConfigApi;
    fetchApi: FetchApi;
    featureFlagsApi: FeatureFlagsApi;
  }) {
    this.configApi = options.configApi;
    this.fetchApi = options.fetchApi;
    this.featureFlagsApi = options.featureFlagsApi;
    this.baseUrl = this.configApi.getString('backend.baseUrl');
    this.probesUrl = this.configApi.getStringArray('healthProbes.probesUrl');
  }

  private createHeaders(): Headers {
    return new Headers({
      Accept: 'application/json',
    });
  }

  private sortHealthDataByApplication(data: EnvironmentHealthData): HealthData {
    const applicationsByName = new Map<string, Record<string, HealthProbe>>();
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
      .map(
        ([application, environments]): ApplicationHealthData => ({
          application,
          environments,
        }),
      );
  }

  private async fetchHealthData(endpointPath: string): Promise<HealthData> {
    try {
      let data: EnvironmentHealthData;

      if (this.featureFlagsApi.isActive('mock-health-dashboard')) {
        const isPrdProbe =
          endpointPath.toLowerCase().includes('prd') &&
          !endpointPath.toLowerCase().includes('nonprd');
        data = dummyCall(isPrdProbe);
      } else {
        const url = new URL(`${this.baseUrl}${endpointPath}`);
        const response = await this.fetchApi.fetch(url, {
          method: 'GET',
          headers: this.createHeaders(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP ${response.status}: Failed to fetch health data - ${errorText}`,
          );
        }

        data = (await response.json()) as EnvironmentHealthData;
      }

      if (!data) {
        throw new Error(
          'Invalid response: expected health data object',
        );
      }

      return this.sortHealthDataByApplication(data);
    } catch (error) {
      const errorMessage = 'Failed to get health data';

      if (error instanceof Error) {
        throw new Error(`${errorMessage}: ${error.message}`);
      }

      throw new Error(`${errorMessage}: Unknown error`);
    }
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }

  async getHealthData(): Promise<HealthDataResponse> {
    if (this.probesUrl.length === 0) {
      return {
        healthData: [],
        errors: [
          {
            source: 'healthProbes.probesUrl',
            message: 'No probe endpoints configured',
          },
        ],
      };
    }

    const results = await Promise.allSettled(
      this.probesUrl.map(endpointPath => this.fetchHealthData(endpointPath)),
    );

    const errors: HealthDataResponse['errors'] = [];
    const healthDataByEndpoint = results.map((result, index) => {
      const endpointPath = this.probesUrl[index];

      if (result.status === 'fulfilled') {
        return result.value;
      }

      errors.push({
        source: endpointPath,
        message: this.toErrorMessage(result.reason),
      });

      return [];
    });

    const mergedHealthDataMap = new Map<
      string,
      ApplicationHealthData['environments']
    >();

    healthDataByEndpoint.forEach((healthData) => {
      healthData.forEach((appHealth) => {
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
        ([application, environments]): ApplicationHealthData => ({
          application,
          environments,
        }),
      ),
      errors,
    };
  }
}

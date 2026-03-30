import { ConfigApi, createApiRef, FetchApi, FeatureFlagsApi } from "@backstage/core-plugin-api";
import { ApplicationHealthData, EnvironmentHealthData, HealthData, HealthProbe } from "../types";
import { dummyCall } from "./fake-data";

export const healthDashboardBackendApiRef = createApiRef<HealthDashboardBackendApi>({
    id: 'plugin.health-dashboard.service',
});

export interface HealthDashboardBackendApi {
    getHealthData(): Promise<HealthData>;
}

export class HealthDashboardBackendClient implements HealthDashboardBackendApi {
    private readonly configApi: ConfigApi;
    private readonly fetchApi: FetchApi;
    private readonly featureFlagsApi: FeatureFlagsApi;
    private readonly baseUrl: string;

    constructor(options: { configApi: ConfigApi, fetchApi: FetchApi, featureFlagsApi: FeatureFlagsApi }) {
        this.configApi = options.configApi;
        this.fetchApi = options.fetchApi;
        this.featureFlagsApi = options.featureFlagsApi;
        this.baseUrl = this.configApi.getString('backend.baseUrl');
    }

    private createHeaders(): Headers {
        return new Headers({
            'Accept': 'application/json',
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
                leftApplication.localeCompare(rightApplication, undefined, { sensitivity: 'base' }),
            )
            .map(([application, environments]): ApplicationHealthData => ({
                application,
                environments,
            }));
    }

    async getHealthData(): Promise<HealthData> {
        try {
            let data: EnvironmentHealthData;
            if (this.featureFlagsApi.isActive('mock-health-dashboard')) {
                data = dummyCall();
            } else {
                const url = new URL(`${this.baseUrl}/api/proxy/health-probes`);
                const headers = this.createHeaders();
                const response = await this.fetchApi.fetch(url, {
                    method: 'GET',
                    headers
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: Failed to fetch health data - ${errorText}`);
                }
                data = await response.json() as EnvironmentHealthData;
            }

            if (!data) {
                throw new Error('Invalid response format: expected environment health data object');
            }

            return this.sortHealthDataByApplication(data);

        } catch (error) {
            const errorMessage = `Failed to get health data`;

            if (error instanceof Error) {
                throw new Error(`${errorMessage}: ${error.message}`);
            }

            throw new Error(`${errorMessage}: Unknown error`);
        }
    }

}
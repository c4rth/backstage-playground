import { ConfigApi, createApiRef, DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import { AppRegistryEndpoint } from "../types";

export const appRegistryBackendApiRef = createApiRef<AppRegistryBackendApi>({
    id: 'plugin.app-registry.service',
});

export interface AppRegistryBackendApi {
    getPolicies(appCode: string, appName: string, appVersion: string, environment: string): Promise<AppRegistryEndpoint[]>;
}


export class AppRegistryBackendClient implements AppRegistryBackendApi {
    private readonly configApi: ConfigApi;
    private readonly fetchApi: FetchApi;

    constructor(options: { configApi: ConfigApi, fetchApi: FetchApi }) {
        this.configApi = options.configApi;
        this.fetchApi = options.fetchApi;
    }

    async getPolicies(appCode: string, appName: string, appVersion: string, environment: string): Promise<AppRegistryEndpoint[]> {
        const url = new URL(
            `${this.configApi.getString('backend.baseUrl')}/api/proxy/app-registry/endpoints?application-code=${appCode}&service-name=${appName}&major-version=${appVersion}&environment=${environment}`,
            // `${this.configApi.getString('appRegistry.baseUrl')}/endpoints?application-code=${appCode}&service-name=${appName}&major-version=${appVersion}&environment=${environment}`,
        );
        const headers = new Headers({
            'Accept': '*/*',
            'x-api-version': this.configApi.getString('appRegistry.version'),
        });
        const response = await this.fetchApi.fetch(url, { headers });
        if (response.status >= 400 && response.status < 600) {
            throw new Error(`${response.status}: Failed fetching AppRegistry ${await response.text()}`);
        }
        const data = (await response.json()) as AppRegistryEndpoint[];
        if (!data) {
            return [];
        }
        return data;
    }

}
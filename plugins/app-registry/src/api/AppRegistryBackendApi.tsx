import { ConfigApi, createApiRef, DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";

export const appRegistryBackendApiRef = createApiRef<AppRegistryBackendApi>({
    id: 'plugin.app-registry.service',
});

export interface AppRegistryBackendApi {
    getPolicies(appCode: string, appName: string, appVersion: string, environment: string): Promise<{ data: any }>;
}


export class AppRegistryBackendClient implements AppRegistryBackendApi {
    private readonly configApi: ConfigApi;
    private readonly discoveryApi: DiscoveryApi;
    private readonly fetchApi: FetchApi;

    constructor(options: { configApi: ConfigApi, discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
        this.configApi = options.configApi;
        this.discoveryApi = options.discoveryApi;
        this.fetchApi = options.fetchApi;
    }

    async getPolicies(appCode: string, appName: string, appVersion: string, environment: string): Promise<{ data: any }> {
        // temp
        await this.discoveryApi.getBaseUrl('backend');
        const url = new URL(
            `${this.configApi.getString('backend.baseUrl')}/api/proxy/app-registry/endpoints?application-code=${appCode}&service-name=${appName}&major-version=${appVersion}&environment=${environment}`,
        );
        const response = await this.fetchApi.fetch(url);
        const items = await response.json();
        return (
            items
        );
    }

}
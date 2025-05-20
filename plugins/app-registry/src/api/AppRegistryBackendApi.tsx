import { ConfigApi, createApiRef, FetchApi } from "@backstage/core-plugin-api";
import { AppRegistryEndpoint, AppRegistryOperation, AppRegistryOperationPdpMapping } from "../types";

export const appRegistryBackendApiRef = createApiRef<AppRegistryBackendApi>({
    id: 'plugin.app-registry.service',
});

export interface AppRegistryBackendApi {
    getOperations(appCode: string, appName: string, appVersion: string, environment: string): Promise<AppRegistryOperation[]>;
}


function getOperationName(endpoint: AppRegistryEndpoint) {
    if (endpoint.cobolName && endpoint.cobolName.length > 0) {
        return endpoint.operationId || endpoint.cobolName;
    }
    return `${endpoint.realPath}`;
}

function isAbac(endpoint: AppRegistryEndpoint) {
    return endpoint.policies?.some(policy => policy.type === 'ACCESS_CHECK' && policy.active);
}


export class AppRegistryBackendClient implements AppRegistryBackendApi {
    private readonly configApi: ConfigApi;
    private readonly fetchApi: FetchApi;

    constructor(options: { configApi: ConfigApi, fetchApi: FetchApi }) {
        this.configApi = options.configApi;
        this.fetchApi = options.fetchApi;
    }

    async getOperations(appCode: string, appName: string, appVersion: string, environment: string): Promise<AppRegistryOperation[]> {
        const url = new URL(
            `${this.configApi.getString('backend.baseUrl')}/api/proxy/app-registry/endpoints?application-code=${appCode}&service-name=${appName}&major-version=${appVersion}&environment=${environment}`,
        );
        const headers = new Headers({
            'Accept': '*/*',
            'x-api-version': this.configApi.getString('appRegistry.version'),
        });
        const response = await this.fetchApi.fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`${response.status}: Failed fetching AppRegistry ${await response.text()}`);
        }
        const data = (await response.json()) as AppRegistryEndpoint[];

        return data.map(endpoint => {
            const abac = isAbac(endpoint) || false;
            let pdpMapping: AppRegistryOperationPdpMapping[] | undefined = undefined;
            if (abac) {
                pdpMapping = endpoint.policies?.flatMap(policy =>
                    policy && 'pdpMapping' in policy && policy.pdpMapping
                        ? policy.pdpMapping.map(mapping => ({
                            valuePath: mapping.valuePath,
                            pdpField: mapping.pdpField,
                        }))
                        : []
                );
                if (pdpMapping && pdpMapping.length === 0) pdpMapping = undefined;
            }
            return {
                method: endpoint.method,
                name: getOperationName(endpoint),
                abac,
                bFunction: endpoint.bFunction,
                pdpMapping,
            };
        });
    }

}
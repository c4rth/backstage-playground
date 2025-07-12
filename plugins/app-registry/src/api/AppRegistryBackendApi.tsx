import { ConfigApi, createApiRef, FetchApi } from "@backstage/core-plugin-api";
import { AppRegistryEndpoint, AppRegistryOperation, AppRegistryOperationPdpMapping } from "../types";

export const appRegistryBackendApiRef = createApiRef<AppRegistryBackendApi>({
    id: 'plugin.app-registry.service',
});

export interface AppRegistryBackendApi {
    getOperations(appCode: string, appName: string, appVersion: string, environment: string): Promise<AppRegistryOperation[]>;
}

function getOperationName(endpoint: AppRegistryEndpoint): string {
    return endpoint.operationId || endpoint.cobolName || endpoint.realPath || 'Unknown Operation';
}

function isAbac(endpoint: AppRegistryEndpoint): boolean {
    return endpoint.policies?.some(policy =>
        policy?.type === 'ACCESS_CHECK' && policy.active === true
    ) ?? false;
}

function extractPdpMapping(abac: boolean, endpoint: AppRegistryEndpoint): AppRegistryOperationPdpMapping[] | undefined {
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
    }
    return pdpMapping;
}

export class AppRegistryBackendClient implements AppRegistryBackendApi {
    private readonly configApi: ConfigApi;
    private readonly fetchApi: FetchApi;
    private readonly baseUrl: string;
    private readonly apiVersion: string;

    constructor(options: { configApi: ConfigApi, fetchApi: FetchApi }) {
        this.configApi = options.configApi;
        this.fetchApi = options.fetchApi;
        this.baseUrl = this.configApi.getString('backend.baseUrl');
        this.apiVersion = this.configApi.getString('appRegistry.version');
    }

    private buildQueryParams(appCode: string, appName: string, appVersion: string, environment: string): URLSearchParams {
        const params = new URLSearchParams();
        params.set('application-code', appCode);
        params.set('service-name', appName);
        params.set('major-version', appVersion);
        params.set('environment', environment);
        return params;
    }

    private createHeaders(): Headers {
        return new Headers({
            'Accept': 'application/json', 
            'x-api-version': this.apiVersion,
        });
    }

    private transformEndpointToOperation(endpoint: AppRegistryEndpoint): AppRegistryOperation {
        const abac = isAbac(endpoint);
        const pdpMapping = extractPdpMapping(abac, endpoint);

        return {
            method: endpoint.method,
            name: getOperationName(endpoint),
            abac,
            bFunction: endpoint.bFunction,
            pdpMapping,
        };
    }

    async getOperations(appCode: string, appName: string, appVersion: string, environment: string): Promise<AppRegistryOperation[]> {
        if (!appCode?.trim() || !appName?.trim() || !appVersion?.trim() || !environment?.trim()) {
            throw new Error('All parameters (appCode, appName, appVersion, environment) are required');
        }

        try {
            const queryParams = this.buildQueryParams(appCode, appName, appVersion, environment);
            const url = new URL(`${this.baseUrl}/api/proxy/app-registry/endpoints`);
            url.search = queryParams.toString();

            const headers = this.createHeaders();

            const response = await this.fetchApi.fetch(url, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: Failed to fetch AppRegistry operations - ${errorText}`);
            }

            const data = await response.json() as AppRegistryEndpoint[];

            if (!Array.isArray(data)) {
                throw new Error('Invalid response format: expected array of endpoints');
            }

            data.map(endpoint => {
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

            return data.map(endpoint => this.transformEndpointToOperation(endpoint));

        } catch (error) {
            const errorMessage = `Failed to get operations for app ${appCode}/${appName}@${appVersion} in ${environment}`;

            if (error instanceof Error) {
                throw new Error(`${errorMessage}: ${error.message}`);
            }

            throw new Error(`${errorMessage}: Unknown error`);
        }
    }

}
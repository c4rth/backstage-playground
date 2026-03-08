import { ConfigApi, createApiRef, FetchApi, FeatureFlagsApi } from "@backstage/core-plugin-api";
import { AppRegistryEndpoint, AppRegistryOperation, AppRegistryOperationPdpMapping } from "../types";
import { dummyCall, dummyEmptyCall } from "./fake-data";

export const appRegistryBackendApiRef = createApiRef<AppRegistryBackendApi>({
    id: 'plugin.app-registry.service',
});

export interface AppRegistryBackendApi {
    getOperations(system: string, appName: string, appVersion: string, environment: string): Promise<AppRegistryOperation[]>;
}

function getOperationName(endpoint: AppRegistryEndpoint): string {
    if (endpoint.cobolName && endpoint.cobolName.length > 0) {
        return endpoint.operationId || endpoint.cobolName;
    }
    return `${endpoint.realPath}`;
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
        if (pdpMapping && pdpMapping.length === 0) pdpMapping = undefined;
    }
    return pdpMapping;
}

export class AppRegistryBackendClient implements AppRegistryBackendApi {
    private readonly configApi: ConfigApi;
    private readonly fetchApi: FetchApi;
    private readonly featureFlagsApi: FeatureFlagsApi;
    private readonly baseUrl: string;
    private readonly apiVersion: string;

    constructor(options: { configApi: ConfigApi, fetchApi: FetchApi, featureFlagsApi: FeatureFlagsApi }) {
        this.configApi = options.configApi;
        this.fetchApi = options.fetchApi;
        this.featureFlagsApi = options.featureFlagsApi;
        this.baseUrl = this.configApi.getString('backend.baseUrl');
        this.apiVersion = this.configApi.getString('appRegistry.version');
    }

    private buildQueryParams(system: string, appName: string, appVersion: string, environment: string): URLSearchParams {
        const params = new URLSearchParams();
        params.set('application-code', system);
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
        const abac = isAbac(endpoint) || false;
        const pdpMapping: AppRegistryOperationPdpMapping[] | undefined = extractPdpMapping(abac, endpoint);
        return {
            method: endpoint.method,
            name: getOperationName(endpoint),
            abac,
            bFunction: endpoint.bFunction,
            pdpMapping,
        };
    }


    async getOperations(system: string, appName: string, appVersion: string, environment: string): Promise<AppRegistryOperation[]> {
        if (!system?.trim() || !appName?.trim() || !appVersion?.trim() || !environment?.trim()) {
            throw new Error('All parameters (system, appName, appVersion, environment) are required');
        }

        try {
            if (this.featureFlagsApi.isActive('mock-app-registry')) {
                const data = environment === 'TST' ? dummyEmptyCall() : dummyCall();
                return data.map(endpoint => this.transformEndpointToOperation(endpoint));
            }
            const queryParams = this.buildQueryParams(system, appName, appVersion, environment);
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
            
            return data.map(endpoint => this.transformEndpointToOperation(endpoint));

        } catch (error) {
            const errorMessage = `Failed to get operations for app ${system}/${appName}@${appVersion} in ${environment}`;

            if (error instanceof Error) {
                throw new Error(`${errorMessage}: ${error.message}`);
            }

            throw new Error(`${errorMessage}: Unknown error`);
        }
    }

}
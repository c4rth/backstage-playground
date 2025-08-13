import { createApiRef, DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import { Entity } from "@backstage/catalog-model";
import { ApiDefinitionListOptions, ApiDefinitionListResult, ApiVersionDefinition, ServiceDefinition, SystemDefinition } from "@internal/plugin-api-platform-common";

export const apiPlatformBackendApiRef = createApiRef<ApiPlatformBackendApi>({
  id: 'plugin.api-platform.service',
});

export interface ApiPlatformBackendApi {
  listApis(options: ApiDefinitionListOptions): Promise<ApiDefinitionListResult>;

  getApisCount(): Promise<number>;

  getApiVersions(apiName: string): Promise<(ApiVersionDefinition[])>;

  listServices(): Promise<{ items: ServiceDefinition[] }>;

  getServiceVersions(system: string, serviceName: string): Promise<(ServiceDefinition)>;

  listSystems(): Promise<{ items: Entity[] }>;

  getSystem(systemName: string): Promise<(SystemDefinition)>;

}

export class ApiPlatformBackendClient implements ApiPlatformBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private baseUrlCache: string | null = null;
  private baseUrlPromise: Promise<string> | null = null;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async getBaseUrl(): Promise<string> {
    if (this.baseUrlCache) {
      return this.baseUrlCache;
    }

    if (this.baseUrlPromise) {
      return this.baseUrlPromise;
    }

    this.baseUrlPromise = this.discoveryApi.getBaseUrl('api-platform');
    this.baseUrlCache = await this.baseUrlPromise;
    this.baseUrlPromise = null;

    return this.baseUrlCache;
  }

  private async fetchJson<T>(path: string, searchParams?: URLSearchParams): Promise<T> {
    try {
      const baseUrl = await this.getBaseUrl();
      const url = new URL(`${baseUrl}${path}`);

      if (searchParams) {
        url.search = searchParams.toString();
      }

      const response = await this.fetchApi.fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  private buildSearchParams(params: Record<string, string | number | undefined>): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    return searchParams;
  }

  async getApisCount(): Promise<number> {
    return this.fetchJson<number>('/apis/count');
  }

  async listApis(options: ApiDefinitionListOptions): Promise<ApiDefinitionListResult> {
    const { offset, limit, orderBy, search } = options;

    const params: Record<string, string | number | undefined> = {
      offset,
      limit,
      search,
    };

    if (orderBy) {
      params.orderBy = `${orderBy.field}=${orderBy.direction}`;
    }

    const searchParams = this.buildSearchParams(params);
    return this.fetchJson<ApiDefinitionListResult>('/apis/definitions', searchParams);
  }

  async getApiVersions(apiName: string): Promise<ApiVersionDefinition[]> {
    if (!apiName?.trim()) {
      throw new Error('API name is required');
    }

    const encodedApiName = encodeURIComponent(apiName);
    const versions = await this.fetchJson<ApiVersionDefinition[]>(`/apis/definitions/${encodedApiName}`);

    return Array.isArray(versions) ? versions : [];
  }

  async listServices(): Promise<{ items: ServiceDefinition[] }> {
    return this.fetchJson<{ items: ServiceDefinition[] }>('/services');
  }

  async getServiceVersions(system: string, serviceName: string): Promise<ServiceDefinition> {
    if (!system?.trim() || !serviceName?.trim()) {
      throw new Error(`System and service name are required : '${system}' '${serviceName}'`);
    }

    const encodedSystemName = encodeURIComponent(system);
    const encodedServiceName = encodeURIComponent(serviceName);
    return this.fetchJson<ServiceDefinition>(`/services/${encodedSystemName}/${encodedServiceName}`);
  }

  async listSystems(): Promise<{ items: Entity[] }> {
    return this.fetchJson<{ items: Entity[] }>('/systems');
  }

  async getSystem(systemName: string): Promise<SystemDefinition> {
    if (!systemName?.trim()) {
      throw new Error('System name is required');
    }

    const encodedSystemName = encodeURIComponent(systemName);
    return this.fetchJson<SystemDefinition>(`/systems/${encodedSystemName}`);
  }

  clearCache(): void {
    this.baseUrlCache = null;
    this.baseUrlPromise = null;
  }

}
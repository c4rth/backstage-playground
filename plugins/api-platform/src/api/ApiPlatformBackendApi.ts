import { createApiRef, DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import {
  ApiDefinitionsListRequest,
  ApiDefinitionListResult,
  ApiVersionDefinition,
  ServiceDefinition,
  ServiceDefinitionsListRequest,
  ServiceDefinitionListResult,
  SystemDefinition,
  SystemDefinitionListResult,
  SystemDefinitionsListRequest,
  OwnershipType,
  LibraryDefinitionsListRequest,
  LibraryDefinitionListResult
} from "@internal/plugin-api-platform-common";

export const apiPlatformBackendApiRef = createApiRef<ApiPlatformBackendApi>({
  id: 'plugin.api-platform.service',
});

export interface ApiPlatformBackendApi {
  listApis(options: ApiDefinitionsListRequest): Promise<ApiDefinitionListResult>;

  getApisCount(ownership: OwnershipType): Promise<number>;

  getApiVersions(system: string, apiName: string): Promise<(ApiVersionDefinition[])>;

  getServicesCount(ownership: OwnershipType): Promise<number>;

  listServices(options: ServiceDefinitionsListRequest): Promise<ServiceDefinitionListResult>;

  getServiceVersions(system: string, serviceName: string): Promise<(ServiceDefinition)>;

  getSystemsCount(ownership: OwnershipType): Promise<number>;

  listSystems(options: SystemDefinitionsListRequest): Promise<SystemDefinitionListResult>;

  getSystem(systemName: string): Promise<(SystemDefinition)>;

  listLibraries(options: LibraryDefinitionsListRequest): Promise<LibraryDefinitionListResult>;

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

  private buildOrderByParam(orderBy?: { field: string; direction: string }): string | undefined {
    return orderBy ? `${orderBy.field}=${orderBy.direction}` : undefined;
  }

  private buildListParams(
    options: { offset?: number; limit?: number; search?: string; ownership?: OwnershipType; orderBy?: { field: string; direction: string } }
  ): URLSearchParams {
    const { offset, limit, search, ownership, orderBy } = options;

    const params: Record<string, string | number | undefined> = {
      offset,
      limit,
      search,
      ownership,
      orderBy: this.buildOrderByParam(orderBy),
    };

    return this.buildSearchParams(params);
  }

  clearCache(): void {
    this.baseUrlCache = null;
    this.baseUrlPromise = null;
  }

  // APIs

  async getApisCount(ownership: OwnershipType): Promise<number> {
    return this.fetchJson<number>('/apis/count', this.buildSearchParams({ ownership }));
  }

  async listApis(options: ApiDefinitionsListRequest): Promise<ApiDefinitionListResult> {
    const searchParams = this.buildListParams(options);
    return this.fetchJson<ApiDefinitionListResult>('/apis/definitions', searchParams);
  }

  async getApiVersions(system: string, apiName: string): Promise<ApiVersionDefinition[]> {
    if (!apiName?.trim()) throw new Error('API name is required');
    const path = `/apis/definitions/${encodeURIComponent(system)}/${encodeURIComponent(apiName)}`;
    const versions = await this.fetchJson<ApiVersionDefinition[]>(path);
    return Array.isArray(versions) ? versions : [];
  }

  // Services

  async getServicesCount(ownership: OwnershipType): Promise<number> {
    return this.fetchJson<number>('/services/count', this.buildSearchParams({ ownership }));
  }

  async listServices(options: ServiceDefinitionsListRequest): Promise<ServiceDefinitionListResult> {
    const searchParams = this.buildListParams(options);
    return this.fetchJson<ServiceDefinitionListResult>('/services/definitions', searchParams);
  }

  async getServiceVersions(system: string, serviceName: string): Promise<ServiceDefinition> {
    if (!system?.trim() || !serviceName?.trim()) {
      throw new Error(`System and service name are required : '${system}' '${serviceName}'`);
    }

    const encodedSystemName = encodeURIComponent(system);
    const encodedServiceName = encodeURIComponent(serviceName);
    return this.fetchJson<ServiceDefinition>(`/services/definitions/${encodedSystemName}/${encodedServiceName}`);
  }

  // Systems

  async getSystemsCount(ownership: OwnershipType): Promise<number> {
    return this.fetchJson<number>('/systems/count', this.buildSearchParams({ ownership }));
  }

  async listSystems(options: SystemDefinitionsListRequest): Promise<SystemDefinitionListResult> {
    const searchParams = this.buildListParams(options);
    return this.fetchJson<SystemDefinitionListResult>('/systems/definitions', searchParams);
  }

  async getSystem(systemName: string): Promise<SystemDefinition> {
    if (!systemName?.trim()) {
      throw new Error('System name is required');
    }

    const encodedSystemName = encodeURIComponent(systemName);
    return this.fetchJson<SystemDefinition>(`/systems/definitions/${encodedSystemName}`);
  }

  // Libraries
  
  async listLibraries(options: LibraryDefinitionsListRequest): Promise<LibraryDefinitionListResult> {
    const searchParams = this.buildListParams(options);
    return this.fetchJson<LibraryDefinitionListResult>('/libraries/definitions', searchParams);
  }

}
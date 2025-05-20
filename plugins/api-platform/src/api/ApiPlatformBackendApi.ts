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

  getServiceVersions(serviceName: string): Promise<(ServiceDefinition)>;

  listSystems(): Promise<{ items: Entity[] }>;

  getSystem(systemName: string): Promise<(SystemDefinition)>;

}

export class ApiPlatformBackendClient implements ApiPlatformBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getApisCount(): Promise<number> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl('api-platform')}/apis/count`
    );
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async listApis(options: ApiDefinitionListOptions): Promise<ApiDefinitionListResult> {
    const { offset, limit, orderBy, search } = options;
    const baseUrl = await this.discoveryApi.getBaseUrl('api-platform');
    const query = new URLSearchParams();
    if (typeof offset === 'number') query.set('offset', String(offset));
    if (typeof limit === 'number') query.set('limit', String(limit));
    if (orderBy) query.set('orderBy', `${orderBy.field}=${orderBy.direction}`);
    if (search) query.set('search', search);
    const url = new URL(`${baseUrl}/apis/definitions?${query}`);
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async getApiVersions(apiName: string): Promise<ApiVersionDefinition[]> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl('api-platform')}/apis/definitions/${apiName}`
    );
    const response = await this.fetchApi.fetch(url);
    return (await response.json()).map((version: ApiVersionDefinition) => ({ ...version }));
  }

  async listServices(): Promise<{ items: ServiceDefinition[] }> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl('api-platform')}/services`
    );
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async getServiceVersions(serviceName: string): Promise<ServiceDefinition> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl('api-platform')}/services/${serviceName}`
    );
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async listSystems(): Promise<{ items: Entity[] }> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl('api-platform')}/systems`
    );
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async getSystem(systemName: string): Promise<SystemDefinition> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl('api-platform')}/systems/${systemName}`
    );
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

}
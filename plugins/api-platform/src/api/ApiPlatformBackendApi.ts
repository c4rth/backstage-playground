import { createApiRef, DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import { Entity } from "@backstage/catalog-model";
import { ApiVersionDefinition, ServiceDefinition } from "@internal/plugin-api-platform-common";

export const apiPlatformBackendApiRef = createApiRef<ApiPlatformBackendApi>({
  id: 'plugin.api-platform.service',
});

export interface ApiPlatformBackendApi {
  listApis(): Promise<{ items: Entity[] }>;

  getApiVersions(request: { apiName: string }): Promise<(ApiVersionDefinition[])>;

  listServices(): Promise<{ items: ServiceDefinition[] }>;

  getServiceVersions(request: { serviceName: string }): Promise<(ServiceDefinition)>;
}


export class ApiPlatformBackendClient implements ApiPlatformBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async listApis(): Promise<{ items: Entity[] }> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'api-platform',
      )}/apis`,
    );
    const response = await this.fetchApi.fetch(url);
    const items = await response.json();
    return (
      items
    );
  }

  async getApiVersions(request: { apiName: string }): Promise<ApiVersionDefinition[]> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'api-platform',
      )}/apis/${request.apiName}`
    );
    const response = await this.fetchApi.fetch(url);
    return (
      (await response.json()).map((version: ApiVersionDefinition) => ({
        ...version,
      })) || undefined
    );
  }

  async listServices(): Promise<{ items: ServiceDefinition[] }> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'api-platform',
      )}/services`,
    );
    const response = await this.fetchApi.fetch(url);
    const items = await response.json();
    return (
      items
    );
  }

  async getServiceVersions(request: { serviceName: string }): Promise<ServiceDefinition> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'api-platform',
      )}/services/${request.serviceName}`
    );
    const response = await this.fetchApi.fetch(url);
    const item = await response.json();
    return (
      item
    );
  }

}
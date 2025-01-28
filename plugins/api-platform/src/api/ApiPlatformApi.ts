import { createApiRef, DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import { Entity } from "@backstage/catalog-model";
import { ApiVersionDefinition } from "@internal/plugin-api-platform-common";

export const apiPlatformApiRef = createApiRef<ApiPlatformApi>({
  id: 'plugin.api-platform.service',
});

export interface ApiPlatformApi {
  listApis(): Promise<{ items: Entity[] }>;

  getApiVersions(request: { apiName: string }): Promise<(ApiVersionDefinition[])>;
}

export class ApiPlatformClient implements ApiPlatformApi {
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
      )}`,
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
      )}/${request.apiName}`,
    );
    const response = await this.fetchApi.fetch(url);
    return (
      (await response.json()).map((version: ApiVersionDefinition) => ({
        ...version,
      })) || undefined
    );
  }

}
import { createApiRef, DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import { ApiDefinition } from "@internal/plugin-api-platform-common";

export const apiPlatformApiRef = createApiRef<ApiPlatformApi>({
  id: 'plugin.api-platform.service',
});

export interface ApiPlatformApi {
  listApiDefinitions(): Promise<{ items: ApiDefinition[] }>;

  getApiDefinition(request: { id: string }): Promise<ApiDefinition>;
}

export class ApiPlatformClient implements ApiPlatformApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }


  async listApiDefinitions(): Promise<{ items: ApiDefinition[] }> {
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

  async getApiDefinition(request: { id: string }): Promise<ApiDefinition> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'api-platform',
      )}/${request.id}`,
    );
    const response = await this.fetchApi.fetch(url);
    return (
      (await response.json()).map((p: ApiDefinition) => ({
        ...p,
      })) || undefined
    );
  }
}
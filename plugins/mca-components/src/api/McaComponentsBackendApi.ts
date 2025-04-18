import { ConfigApi, createApiRef, DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import { McaComponent, McaComponentListOptions, McaComponentListResult } from "@internal/plugin-mca-components-common";

export const mcaComponentsBackendApiRef = createApiRef<McaComponentsBackendApi>({
  id: 'plugin.mca-components.service',
});

export interface McaComponentsBackendApi {

  getMcaComponentsCount(): Promise<number>;

  listMcaComponents(options: McaComponentListOptions): Promise<McaComponentListResult>

  getMcaComponent(component: string): Promise<McaComponent | undefined>

  getMcaComponentDefinition(component: string, packageName: string, refP: string): Promise<string | undefined>

}

export class McaComponentsBackendClient implements McaComponentsBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly configApi: ConfigApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi; configApi: ConfigApi, }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.configApi = options.configApi;
  }

  async getMcaComponentsCount(): Promise<number> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl(
        'mca-components',
      )}/mca/count`
    );
    const response = await this.fetchApi.fetch(url);
    const item = await response.json();
    return (
      item
    );
  }

  async listMcaComponents(options: McaComponentListOptions): Promise<McaComponentListResult> {
    const { offset, limit, orderBy, search } = options;
    const baseUrl = await this.discoveryApi.getBaseUrl('mca-components');
    const query = new URLSearchParams();
    if (typeof offset === 'number') {
      query.set('offset', String(offset));
    }
    if (typeof limit === 'number') {
      query.set('limit', String(limit));
    }
    if (orderBy) {
      query.set('orderBy', `${orderBy.field}=${orderBy.direction}`);
    }
    if (search) {
      query.set('search', search);
    }
    const url = new URL(`${baseUrl}/mca/components?${query}`);
    const response = await this.fetchApi.fetch(url);
    const items = await response.json();
    return (
      items
    );
  }

  async getMcaComponent(component: string): Promise<McaComponent | undefined> {
    const url = new URL(
      `${await this.discoveryApi.getBaseUrl('mca-components')}/mca/components/${component}`
    );
    const response = await this.fetchApi.fetch(url);
    const item = await response.json();
    return (
      item
    );
  }

  async getMcaComponentDefinition(component: string, packageName: string, refP: string): Promise<string | undefined> {
    const url = new URL(
      `${this.configApi.getString('backend.baseUrl')}/api/proxy/operations-sources/v1/operation-sources/${component}.osml/historic?packageName=${packageName}&refP=${refP}`,
    );
    const response = await this.fetchApi.fetch(url);
    return (
      response.ok ? response.text() : undefined
    );
  }

}
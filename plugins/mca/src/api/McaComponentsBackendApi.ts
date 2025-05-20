import { ConfigApi, createApiRef, DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import { McaBaseType, McaBaseTypeListOptions, McaBaseTypeListResult, McaComponent, McaComponentListOptions, McaComponentListResult, McaComponentType, McaVersions } from '@internal/plugin-mca-common';

export const mcaComponentsBackendApiRef = createApiRef<McaComponentsBackendApi>({
  id: 'plugin.mca.service',
});

export interface McaComponentsBackendApi {

  getMcaComponentsCount(type: McaComponentType): Promise<number>;

  listMcaComponents(options: McaComponentListOptions): Promise<McaComponentListResult>;

  getMcaComponent(component: string): Promise<McaComponent | undefined>;

  getMcaComponentDefinition(component: string, refP: string): Promise<string | undefined>;

  getMcaVersions(): Promise<McaVersions | undefined>;

  listMcaBaseTypes(options: McaBaseTypeListOptions): Promise<McaBaseTypeListResult>;

  getMcaBaseTypesCount(): Promise<number>;

  getMcaBaseType(baseType: string): Promise<McaBaseType | undefined>;

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

  async getMcaComponentsCount(type: McaComponentType): Promise<number> {
    const url = new URL(`${await this.discoveryApi.getBaseUrl('mca')}/mca/count?type=${type}`);
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async listMcaComponents(options: McaComponentListOptions): Promise<McaComponentListResult> {
    const { offset, limit, orderBy, search, type } = options;
    const baseUrl = await this.discoveryApi.getBaseUrl('mca');
    const query = new URLSearchParams();
    if (typeof offset === 'number') query.set('offset', String(offset));
    if (typeof limit === 'number') query.set('limit', String(limit));
    if (orderBy) query.set('orderBy', `${orderBy.field}=${orderBy.direction}`);
    if (search) query.set('search', search);
    query.set('type', type);
    const url = new URL(`${baseUrl}/mca/components?${query}`);
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async getMcaComponent(component: string): Promise<McaComponent | undefined> {
    const url = new URL(`${await this.discoveryApi.getBaseUrl('mca')}/mca/components/${component}`);
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async getMcaComponentDefinition(component: string, refP: string): Promise<string | undefined> {
    const extension = component.startsWith('Operation') ? 'osml' : 'esml';
    const url = new URL(
      `${this.configApi.getString('backend.baseUrl')}/api/proxy/operations-sources/v1/operation-sources/${component}.${extension}/active?env=TST&myCurrentP=${refP}`,
    );
    const response = await this.fetchApi.fetch(url);
    return response.ok ? response.text() : undefined;
  }

  async getMcaVersions(): Promise<McaVersions> {
    const url = new URL(`${await this.discoveryApi.getBaseUrl('mca')}/mca/versions`);
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async getMcaBaseTypesCount(): Promise<number> {
    const url = new URL(`${await this.discoveryApi.getBaseUrl('mca')}/basetypes/count`);
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async listMcaBaseTypes(options: McaBaseTypeListOptions): Promise<McaBaseTypeListResult> {
    const { offset, limit, orderBy, search } = options;
    const baseUrl = await this.discoveryApi.getBaseUrl('mca');
    const query = new URLSearchParams();
    if (typeof offset === 'number') query.set('offset', String(offset));
    if (typeof limit === 'number') query.set('limit', String(limit));
    if (orderBy) query.set('orderBy', `${orderBy.field}=${orderBy.direction}`);
    if (search) query.set('search', search);
    const url = new URL(`${baseUrl}/basetypes/components?${query}`);
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

  async getMcaBaseType(baseType: string): Promise<McaBaseType | undefined> {
    const url = new URL(`${await this.discoveryApi.getBaseUrl('mca')}/baseTypes/components/${baseType}`);
    const response = await this.fetchApi.fetch(url);
    return await response.json();
  }

}
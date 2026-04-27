import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import {
  McaBaseType,
  McaBaseTypeListOptions,
  McaBaseTypeListResult,
  McaComponent,
  McaComponentListOptions,
  McaComponentListResult,
  McaComponentType,
  McaVersions,
} from '@internal/plugin-mca-common';

export const mcaComponentsBackendApiRef = createApiRef<McaComponentsBackendApi>(
  {
    id: 'plugin.mca.service',
  },
);

export interface McaComponentsBackendApi {
  getMcaComponentsCount(type: McaComponentType): Promise<number>;

  listMcaComponents(
    options: McaComponentListOptions,
  ): Promise<McaComponentListResult>;

  getMcaComponent(component: string): Promise<McaComponent | undefined>;

  getMcaComponentDefinition(
    component: string,
    refP: string,
  ): Promise<string | undefined>;

  getMcaVersions(): Promise<McaVersions | undefined>;

  listMcaBaseTypes(
    options: McaBaseTypeListOptions,
  ): Promise<McaBaseTypeListResult>;

  getMcaBaseTypesCount(): Promise<number>;

  getMcaBaseType(baseType: string): Promise<McaBaseType | undefined>;
}

export class McaComponentsBackendClient implements McaComponentsBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly configApi: ConfigApi;
  private baseUrlCache: string | null = null;
  private baseUrlPromise: Promise<string> | null = null;
  private backendBaseUrl: string;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    configApi: ConfigApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.configApi = options.configApi;
    this.backendBaseUrl = this.configApi.getString('backend.baseUrl');
  }

  private async getMcaBaseUrl(): Promise<string> {
    if (this.baseUrlCache) {
      return this.baseUrlCache;
    }
    if (this.baseUrlPromise) {
      return this.baseUrlPromise;
    }
    this.baseUrlPromise = this.discoveryApi.getBaseUrl('mca');
    this.baseUrlCache = await this.baseUrlPromise;
    this.baseUrlPromise = null;

    return this.baseUrlCache;
  }

  private buildQueryParams(
    params: Record<string, string | number | undefined>,
  ): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    return searchParams;
  }

  private async fetchJson<T>(url: URL): Promise<T> {
    try {
      const response = await this.fetchApi.fetch(url);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorBody || response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  private async fetchOctetStreamAsText(url: URL): Promise<string> {
    try {
      const response = await this.fetchApi.fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      return new TextDecoder('cp1252').decode(buffer);
    } catch (error) {
      throw error;
    }
  }

  async getMcaComponentsCount(type: McaComponentType): Promise<number> {
    const baseUrl = await this.getMcaBaseUrl();
    const searchParams = this.buildQueryParams({ type });
    const url = new URL(`${baseUrl}/mca/count`);
    url.search = searchParams.toString();

    return this.fetchJson<number>(url);
  }

  async listMcaComponents(
    options: McaComponentListOptions,
  ): Promise<McaComponentListResult> {
    const { offset, limit, orderBy, search, type } = options;
    const baseUrl = await this.getMcaBaseUrl();
    const params: Record<string, string | number | undefined> = {
      type,
      offset,
      limit,
      search: search?.trim(),
    };

    if (orderBy) {
      params.orderBy = `${orderBy.field}=${orderBy.direction}`;
    }

    const searchParams = this.buildQueryParams(params);
    const url = new URL(`${baseUrl}/mca/components`);
    url.search = searchParams.toString();

    return this.fetchJson<McaComponentListResult>(url);
  }

  async getMcaComponent(component: string): Promise<McaComponent | undefined> {
    const baseUrl = await this.getMcaBaseUrl();
    const encodedComponent = encodeURIComponent(component.trim());
    const url = new URL(`${baseUrl}/mca/components/${encodedComponent}`);
    return this.fetchJson<McaComponent>(url);
  }

  async getMcaComponentDefinition(
    component: string,
    refP: string,
  ): Promise<string | undefined> {
    const extension = component.startsWith('Operation') ? 'osml' : 'esml';
    const encodedComponent = encodeURIComponent(component.trim());
    const encodedRefP = encodeURIComponent(
      refP.trim().replace(/^P/, '').replace(/^0+/, ''),
    );

    const searchParams = this.buildQueryParams({
      env: 'TST',
      myCurrentP: encodedRefP,
    });

    const url = new URL(
      `${this.backendBaseUrl}/api/proxy/operations-sources/api/v1/sources/OPER/${encodedComponent}.${extension}`,
    );
    url.search = searchParams.toString();

    return this.fetchOctetStreamAsText(url);
  }

  async getMcaVersions(): Promise<McaVersions> {
    const baseUrl = await this.getMcaBaseUrl();
    const url = new URL(`${baseUrl}/mca/versions`);

    return this.fetchJson<McaVersions>(url);
  }

  async getMcaBaseTypesCount(): Promise<number> {
    const baseUrl = await this.getMcaBaseUrl();
    const url = new URL(`${baseUrl}/basetypes/count`);

    return this.fetchJson<number>(url);
  }

  async listMcaBaseTypes(
    options: McaBaseTypeListOptions,
  ): Promise<McaBaseTypeListResult> {
    const { offset, limit, orderBy, search } = options;

    const baseUrl = await this.getMcaBaseUrl();
    const params: Record<string, string | number | undefined> = {
      offset,
      limit,
      search: search?.trim(),
    };

    if (orderBy) {
      params.orderBy = `${orderBy.field}=${orderBy.direction}`;
    }

    const searchParams = this.buildQueryParams(params);
    const url = new URL(`${baseUrl}/basetypes/components`);
    url.search = searchParams.toString();

    return this.fetchJson<McaBaseTypeListResult>(url);
  }

  async getMcaBaseType(baseType: string): Promise<McaBaseType | undefined> {
    const baseUrl = await this.getMcaBaseUrl();
    const encodedBaseType = encodeURIComponent(baseType.trim());
    const url = new URL(`${baseUrl}/baseTypes/components/${encodedBaseType}`);

    return this.fetchJson<McaBaseType>(url);
  }

  clearCache(): void {
    this.baseUrlCache = null;
    this.baseUrlPromise = null;
  }
}

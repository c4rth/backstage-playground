import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { TranslationApi } from '@backstage/frontend-plugin-api';
import { getApiPlatformTranslator } from './translation';
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
  LibraryDefinitionListResult,
  LibraryDefinition,
  OpenApiType,
  DependentsType,
} from '@internal/plugin-api-platform-common';

export interface ApiPlatformBackendApi {
  listApis(
    options: ApiDefinitionsListRequest,
  ): Promise<ApiDefinitionListResult>;

  getApisCount(
    ownershipType: OwnershipType,
    apiType: OpenApiType,
  ): Promise<number>;

  getApiVersions(
    system: string,
    apiName: string,
  ): Promise<ApiVersionDefinition[]>;

  getServicesCount(ownershipType: OwnershipType): Promise<number>;

  listServices(
    options: ServiceDefinitionsListRequest,
  ): Promise<ServiceDefinitionListResult>;

  getServiceVersions(
    system: string,
    serviceName: string,
  ): Promise<ServiceDefinition>;

  getSystemsCount(ownershipType: OwnershipType): Promise<number>;

  listSystems(
    options: SystemDefinitionsListRequest,
  ): Promise<SystemDefinitionListResult>;

  getSystem(systemName: string): Promise<SystemDefinition>;

  listLibraries(
    options: LibraryDefinitionsListRequest,
  ): Promise<LibraryDefinitionListResult>;

  getLibraryVersions(
    system: string,
    libraryName: string,
    servicesCount: boolean,
  ): Promise<LibraryDefinition[]>;

  unregisterEntity(kind: string, name: string): Promise<void>;

  refreshEntity(kind: string, name: string): Promise<void>;
}

export class ApiPlatformBackendClient implements ApiPlatformBackendApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;
  private readonly translationApi: TranslationApi;
  private baseUrlCache: string | null = null;
  private baseUrlPromise: Promise<string> | null = null;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    fetchApi: FetchApi;
    translationApi: TranslationApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.translationApi = options.translationApi;
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

  private async fetchJson<T>(
    path: string,
    searchParams?: URLSearchParams,
  ): Promise<T> {
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

  private buildSearchParams(
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

  private buildOrderByParam(orderBy?: {
    field: string;
    direction: string;
  }): string | undefined {
    return orderBy ? `${orderBy.field}=${orderBy.direction}` : undefined;
  }

  private buildListParams(options: {
    offset?: number;
    limit?: number;
    search?: string;
    ownershipType?: OwnershipType;
    apiType?: OpenApiType;
    orderBy?: { field: string; direction: string };
    dependsOn?: string;
    dependentsType?: DependentsType;
  }): URLSearchParams {
    const {
      offset,
      limit,
      search,
      ownershipType,
      apiType,
      orderBy,
      dependsOn,
      dependentsType,
    } = options;

    const params: Record<string, string | number | undefined> = {
      offset,
      limit,
      search,
      ownershipType,
      apiType,
      orderBy: this.buildOrderByParam(orderBy),
      dependsOn,
      dependentsType,
    };
    return this.buildSearchParams(params);
  }

  clearCache(): void {
    this.baseUrlCache = null;
    this.baseUrlPromise = null;
  }

  // APIs

  async getApisCount(
    ownershipType: OwnershipType,
    apiType: OpenApiType,
  ): Promise<number> {
    return this.fetchJson<number>(
      '/apis/count',
      this.buildSearchParams({ ownershipType, apiType }),
    );
  }

  async listApis(
    options: ApiDefinitionsListRequest,
  ): Promise<ApiDefinitionListResult> {
    const searchParams = this.buildListParams(options);
    return this.fetchJson<ApiDefinitionListResult>(
      '/apis/definitions',
      searchParams,
    );
  }

  async getApiVersions(
    system: string,
    apiName: string,
  ): Promise<ApiVersionDefinition[]> {
    if (!apiName?.trim()) {
      const t = await getApiPlatformTranslator(this.translationApi);
      throw new Error(t('api.apiNameRequired'));
    }
    const path = `/apis/definitions/${encodeURIComponent(system)}/${encodeURIComponent(apiName)}`;
    const versions = await this.fetchJson<ApiVersionDefinition[]>(path);
    return Array.isArray(versions) ? versions : [];
  }

  // Services

  async getServicesCount(ownershipType: OwnershipType): Promise<number> {
    return this.fetchJson<number>(
      '/services/count',
      this.buildSearchParams({ ownershipType }),
    );
  }

  async listServices(
    options: ServiceDefinitionsListRequest,
  ): Promise<ServiceDefinitionListResult> {
    const searchParams = this.buildListParams(options);
    return this.fetchJson<ServiceDefinitionListResult>(
      '/services/definitions',
      searchParams,
    );
  }

  async getServiceVersions(
    system: string,
    serviceName: string,
  ): Promise<ServiceDefinition> {
    if (!system?.trim() || !serviceName?.trim()) {
      const t = await getApiPlatformTranslator(this.translationApi);
      throw new Error(t('api.serviceNameRequired', { system, serviceName }));
    }

    const encodedSystemName = encodeURIComponent(system);
    const encodedServiceName = encodeURIComponent(serviceName);
    return this.fetchJson<ServiceDefinition>(
      `/services/definitions/${encodedSystemName}/${encodedServiceName}`,
    );
  }

  // Systems

  async getSystemsCount(ownershipType: OwnershipType): Promise<number> {
    return this.fetchJson<number>(
      '/systems/count',
      this.buildSearchParams({ ownershipType }),
    );
  }

  async listSystems(
    options: SystemDefinitionsListRequest,
  ): Promise<SystemDefinitionListResult> {
    const searchParams = this.buildListParams(options);
    return this.fetchJson<SystemDefinitionListResult>(
      '/systems/definitions',
      searchParams,
    );
  }

  async getSystem(systemName: string): Promise<SystemDefinition> {
    if (!systemName?.trim()) {
      const t = await getApiPlatformTranslator(this.translationApi);
      throw new Error(t('api.systemNameRequired'));
    }

    const encodedSystemName = encodeURIComponent(systemName);
    return this.fetchJson<SystemDefinition>(
      `/systems/definitions/${encodedSystemName}`,
    );
  }

  // Libraries

  async listLibraries(
    options: LibraryDefinitionsListRequest,
  ): Promise<LibraryDefinitionListResult> {
    const searchParams = this.buildListParams(options);
    return this.fetchJson<LibraryDefinitionListResult>(
      '/libraries/definitions',
      searchParams,
    );
  }

  async getLibraryVersions(
    system: string,
    libraryName: string,
    servicesCount: boolean,
  ): Promise<LibraryDefinition[]> {
    if (!libraryName?.trim()) {
      const t = await getApiPlatformTranslator(this.translationApi);
      throw new Error(t('api.libraryNameRequired'));
    }
    const path = `/libraries/definitions/${encodeURIComponent(system)}/${encodeURIComponent(libraryName)}?servicesCount=${servicesCount}`;
    const versions = await this.fetchJson<LibraryDefinition[]>(path);
    return Array.isArray(versions) ? versions : [];
  }

  // Catalog Entity Unregister

  async unregisterEntity(kind: string, name: string): Promise<void> {
    const encodedKind = encodeURIComponent(kind);
    const encodedName = encodeURIComponent(name);
    const baseUrl = await this.getBaseUrl();
    const url = new URL(`${baseUrl}/catalog/${encodedKind}/${encodedName}`);

    const response = await this.fetchApi.fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      const t = await getApiPlatformTranslator(this.translationApi);
      throw new Error(
        t('api.unregisterError', {
          status: String(response.status),
          detail: response.statusText,
        }),
      );
    }
  }

  async refreshEntity(kind: string, name: string): Promise<void> {
    const encodedKind = encodeURIComponent(kind);
    const encodedName = encodeURIComponent(name);
    const baseUrl = await this.getBaseUrl();
    const url = new URL(`${baseUrl}/catalog/${encodedKind}/${encodedName}`);

    const response = await this.fetchApi.fetch(url, { method: 'PATCH' });
    if (!response.ok) {
      const t = await getApiPlatformTranslator(this.translationApi);
      throw new Error(
        t('api.refreshError', {
          status: String(response.status),
          detail: response.statusText,
        }),
      );
    }
  }
}

import { ApiVersionDefinition } from "@internal/plugin-api-platform-common";

export interface ApiPlatformService {

  listApis(): Promise<{ items: any[] }>;

  getApiVersions(request: { apiName: string }): Promise<ApiVersionDefinition[]>;

  getApiMatchingVersion(request: { apiName: string, apiVersion: string }): Promise<ApiVersionDefinition | undefined>;

  registerCatalogInfo(location: { target: string }): Promise<String>;
}

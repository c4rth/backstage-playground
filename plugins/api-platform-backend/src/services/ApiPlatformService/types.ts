import { ApiDefinitionListResult, ApiDefinitionsListFields, ApiVersionDefinition } from "@internal/plugin-api-platform-common";

export type ApiDefinitionsOptions = {
  field: ApiDefinitionsListFields;
  direction: 'asc' | 'desc';
};

export type ApiDefinitionsListRequest = {
  offset?: number,
  limit?: number,
  orderBy?: ApiDefinitionsOptions,
  search?: string,
};

export interface ApiPlatformService {

  getApisCount(): Promise<number>;

  listApis(request: ApiDefinitionsListRequest): Promise<ApiDefinitionListResult>;

  getApiVersions(request: { apiName: string }): Promise<ApiVersionDefinition[]>;

  getApiMatchingVersion(request: { apiName: string, apiVersion: string }): Promise<ApiVersionDefinition | undefined>;
}

import {
  ApiDefinitionListResult,
  ApiDefinitionsListRequest,
  ApiRelationDefinition,
  ApiType,
  ApiVersionDefinition,
  OwnershipType
} from "@internal/plugin-api-platform-common";

export type RelationType = 'provider' | 'consumer';

export interface ApiService {

  getApisCount(ownership: OwnershipType, apiType: ApiType, userEntityRef: string | undefined): Promise<number>;

  listApis(request: ApiDefinitionsListRequest): Promise<ApiDefinitionListResult>;

  getApiVersions(request: { system: string, apiName: string }): Promise<ApiVersionDefinition[]>;

  getApiMatchingVersion(request: { system: string, apiName: string, apiVersion: string }): Promise<ApiVersionDefinition | undefined>;

  getApiRelations(request: { system: string, apiName: string, relationType: RelationType }): Promise<ApiRelationDefinition[]>;

}

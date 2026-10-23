import {
  ApiDefinitionListResult,
  ApiDefinitionsListRequest,
  ApiRelationsDefinition,
  OpenApiType,
  ApiVersionDefinition,
  OwnershipType,
  ApiRelationType,
} from '@internal/plugin-api-platform-common';

export interface ApiService {
  getApisCount(
    ownership: OwnershipType,
    apiType: OpenApiType,
    userEntityRef: string | undefined,
  ): Promise<number>;

  listApis(
    request: ApiDefinitionsListRequest,
  ): Promise<ApiDefinitionListResult>;

  getApiVersions(request: {
    system: string;
    apiName: string;
  }): Promise<ApiVersionDefinition[]>;

  getApiMatchingVersion(request: {
    system: string;
    apiName: string;
    apiVersion: string;
  }): Promise<ApiVersionDefinition | undefined>;

  getApiRelations(request: {
    system: string;
    apiName: string;
    relationType: ApiRelationType;
  }): Promise<ApiRelationsDefinition[]>;
}

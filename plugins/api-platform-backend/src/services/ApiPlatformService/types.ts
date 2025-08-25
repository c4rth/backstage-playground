import { 
  ApiDefinitionListResult, 
  ApiDefinitionsListRequest, 
  ApiRelationDefinition, 
  ApiVersionDefinition 
} from "@internal/plugin-api-platform-common";

export type RelationType = 'provider' | 'consumer';

export interface ApiPlatformService {

  getApisCount(): Promise<number>;

  listApis(request: ApiDefinitionsListRequest): Promise<ApiDefinitionListResult>;

  getApiVersions(request: { system: string, apiName: string }): Promise<ApiVersionDefinition[]>;

  getApiMatchingVersion(request: { system: string, apiName: string, apiVersion: string }): Promise<ApiVersionDefinition | undefined>;

  getApiRelations(request: { system: string, apiName: string, relationType: RelationType }): Promise<ApiRelationDefinition[]>;

}

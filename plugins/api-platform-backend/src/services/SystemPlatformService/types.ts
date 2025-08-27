import { SystemDefinition, SystemDefinitionListResult, SystemDefinitionsListRequest, SystemDefinitionType } from "@internal/plugin-api-platform-common";

export interface SystemPlatformService {

  getSystemsCount(type: SystemDefinitionType, userEntityRef: string | undefined): Promise<number>;

  listSystems(request: SystemDefinitionsListRequest): Promise<SystemDefinitionListResult>;

  getSystem(systemName: string): Promise<SystemDefinition>;
  
}

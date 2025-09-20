import { SystemDefinition, SystemDefinitionListResult, SystemDefinitionsListRequest, OwnershipType } from "@internal/plugin-api-platform-common";

export interface SystemPlatformService {

  getSystemsCount(ownership: OwnershipType, userEntityRef: string | undefined): Promise<number>;

  listSystems(request: SystemDefinitionsListRequest): Promise<SystemDefinitionListResult>;

  getSystem(systemName: string): Promise<SystemDefinition>;
  
}

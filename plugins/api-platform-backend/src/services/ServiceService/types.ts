import { 
  OwnershipType,
  ServiceDefinition, 
  ServiceDefinitionListResult, 
  ServiceDefinitionsListRequest, 
} from "@internal/plugin-api-platform-common";

export interface ServiceService {

  // api-platform frontend
  
  getServicesCount(ownership: OwnershipType, userEntityRef: string | undefined): Promise<number>;

  listServices(request: ServiceDefinitionsListRequest): Promise<ServiceDefinitionListResult>;

  getServiceVersions(request: { system: string, serviceName: string }): Promise<ServiceDefinition>;

}
import { 
  OwnershipType,
  ServiceDefinition, 
  ServiceDefinitionListResult, 
  ServiceDefinitionsListRequest, 
  ServiceInformation 
} from "@internal/plugin-api-platform-common";



export interface ServicePlatformService {

  // api-platform frontend
  
  getServicesCount(ownership: OwnershipType, userEntityRef: string | undefined): Promise<number>;

  listServices(request: ServiceDefinitionsListRequest): Promise<ServiceDefinitionListResult>;

  getServiceVersions(request: { system: string, serviceName: string }): Promise<ServiceDefinition>;

  // api-management service

  getServiceInformation(request: { applicationCode: string, serviceName: string, serviceVersion: string, imageVersion: string }): Promise<ServiceInformation | undefined>;

  addServiceInformation(request: { serviceInformation: ServiceInformation }): Promise<string>;
}
import { ServiceDefinition, ServiceInformation } from "@internal/plugin-api-platform-common";
 
export interface ServicePlatformService {
 
  // api-platform frontend
 
  listServices(): Promise<{ items: ServiceDefinition[] }>;
 
  getServiceVersions(request: { serviceName: string }): Promise<ServiceDefinition>;
 
  // api-management service
 
  getServiceInformation(request: { serviceName: string, serviceVersion: string, containerVersion: string }): Promise<ServiceInformation | undefined>;
 
  addServiceInformation(request: { serviceInformation: ServiceInformation }): Promise<string>;
}
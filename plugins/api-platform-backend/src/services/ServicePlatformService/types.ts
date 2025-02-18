import { ServiceApisDefinition, ServiceDefinition } from "@internal/plugin-api-platform-common";

export interface ServicePlatformService {

  listServices(): Promise<{ items: ServiceDefinition[] }>;

  getServiceVersions(request: { serviceName: string }): Promise<ServiceDefinition>;

  getServiceApis(request: { serviceName: string, serviceVersion: string, containerVersion: string}): Promise<ServiceApisDefinition>;

  addServiceApis(request: { serviceName: string, serviceVersion: string, containerVersion: string, consumedApis?: string[], providedApis?: string[]}): Promise<string>;
}

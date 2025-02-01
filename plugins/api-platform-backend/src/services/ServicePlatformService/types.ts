import { ServiceDefinition } from "@internal/plugin-api-platform-common";

export interface ServicePlatformService {

  listServices(): Promise<{ items: ServiceDefinition[] }>;

  getServiceVersions(request: { serviceName: string }): Promise<ServiceDefinition>;
}

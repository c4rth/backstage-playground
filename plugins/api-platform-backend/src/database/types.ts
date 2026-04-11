import { ServiceInformation } from "@internal/plugin-api-platform-common";

export interface ApiPlatformStore {

  storeServiceInformation(serviceInformation: ServiceInformation): Promise<void>;
  getServiceInformation(system: string, service: string, version: string, imageVersion: string): Promise<ServiceInformation | undefined>;

}
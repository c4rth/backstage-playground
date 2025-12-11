import {
  ServiceInformation
} from "@internal/plugin-api-platform-common";

export interface ServiceInformationService {

  getServiceInformation(request: { applicationCode: string, serviceName: string, serviceVersion: string, imageVersion: string }): Promise<ServiceInformation | undefined>;

  addServiceInformation(request: { serviceInformation: ServiceInformation }): Promise<string>;

}
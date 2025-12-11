import { LoggerService } from '@backstage/backend-plugin-api';
import { ServiceInformationService } from './types';
import {
  ServiceInformation,
} from '@internal/plugin-api-platform-common';
import { ApiPlatformStore } from '../../database/apiPlatformStore';


export interface ServiceInformationServiceOptions {
  logger: LoggerService;
  apiStore: ApiPlatformStore;
}

export async function serviceInformationService(options: ServiceInformationServiceOptions): Promise<ServiceInformationService> {
  const { logger, apiStore } = options;

  logger.info('Initializing ServiceInformationService');

  return {

    async getServiceInformation(request: { applicationCode: string, serviceName: string, serviceVersion: string, imageVersion: string }): Promise<ServiceInformation | undefined> {
      const { applicationCode, serviceName, serviceVersion, imageVersion } = request;
      const res = await apiStore.getServiceInformation(applicationCode, serviceName, serviceVersion, imageVersion);
      if (res) {
        return res;
      }
      return {
        applicationCode,
        serviceName,
        serviceVersion,
        imageVersion,
        repository: '',
        sonarQubeProjectKey: '',
        apiDependencies: {},
        dependencies: [],
      };
    },

    async addServiceInformation(request: { serviceInformation: ServiceInformation }): Promise<string> {
      const { serviceInformation } = request;
      await apiStore.storeServiceInformation(serviceInformation);
      return "ok";
    },

  }
}
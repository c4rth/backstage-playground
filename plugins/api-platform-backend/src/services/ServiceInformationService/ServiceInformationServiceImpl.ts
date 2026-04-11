import { coreServices, createServiceFactory, createServiceRef, LoggerService } from '@backstage/backend-plugin-api';
import { ServiceInformationService } from './types';
import {
  ServiceInformation,
} from '@internal/plugin-api-platform-common';
import { ApiPlatformStore, apiPlatformStoreServiceRef } from '../../database';


export interface ServiceInformationServiceOptions {
  logger: LoggerService;
  apiPlatformStore: ApiPlatformStore;
}

export class ServiceInformationServiceImpl implements ServiceInformationService {

  private readonly apiPlatformStore: ApiPlatformStore;

  constructor(options: ServiceInformationServiceOptions) {
    this.apiPlatformStore = options.apiPlatformStore;

    options.logger.info('Initializing ServiceInformationService');
  }

  async getServiceInformation(request: { applicationCode: string, serviceName: string, serviceVersion: string, imageVersion: string }): Promise<ServiceInformation | undefined> {
    const { applicationCode, serviceName, serviceVersion, imageVersion } = request;
      const res = await this.apiPlatformStore.getServiceInformation(applicationCode, serviceName, serviceVersion, imageVersion);
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
  }

  async addServiceInformation(request: { serviceInformation: ServiceInformation }): Promise<string> {
    const { serviceInformation } = request;
      await this.apiPlatformStore.storeServiceInformation(serviceInformation);
      return "ok";
  }
}

export const serviceInformationServiceRef = createServiceRef<ServiceInformationService>({
  id: 'api-platform.service-information.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        apiPlatformStore: apiPlatformStoreServiceRef,
      },
      async factory({ logger, apiPlatformStore }) {
        const serviceInformationService = new ServiceInformationServiceImpl({
          logger,
          apiPlatformStore,
        });
        return serviceInformationService;
      },
    }),
});
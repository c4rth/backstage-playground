import {
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
} from '@backstage/backend-plugin-api';
import {
  McaBaseTypeListRequest,
  McaComponentListRequest,
  McaService,
} from './types';
import { McaComponentStore, mcaComponentStoreServiceRef } from '../database';
import {
  McaBaseType,
  McaBaseTypeListResult,
  McaComponent,
  McaComponentListResult,
  McaComponentType,
  McaVersions,
} from '@internal/plugin-mca-common';
import { Config } from '@backstage/config';
import { McaOperationScheduledTask, McaBaseTypeScheduledTask } from '../task';

export interface McaServiceOptions {
  logger: LoggerService;
  mcaComponentsStore: McaComponentStore;
  scheduler: SchedulerService;
  config: Config;
}

const DEFAULT_MCA_VERSIONS: McaVersions = {
  p1Version: 'P+1',
  p2Version: 'P+2',
  p3Version: 'P+3',
  p4Version: 'P+4',
};

export class McaComponentService implements McaService {
  private readonly logger: LoggerService;
  private readonly mcaComponentsStore: McaComponentStore;

  constructor(options: McaServiceOptions) {
    this.logger = options.logger;
    this.mcaComponentsStore = options.mcaComponentsStore;
    this.logger.info('Initializing McaService');
    this.createScheduledTask(
      options.config,
      options.logger,
      options.mcaComponentsStore,
      options.scheduler,
    );
  }

  async createScheduledTask(
    config: Config,
    logger: LoggerService,
    mcaComponentsStore: McaComponentStore,
    scheduler: SchedulerService,
  ) {
    const scheduleOperations =
      readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('mcaComponents.operations.schedule'),
      );
    await scheduler.scheduleTask({
      ...scheduleOperations,
      id: 'update-all-operations-csv',
      fn: async () => {
        McaOperationScheduledTask.create({
          logger,
          mcaComponentsStore,
          config,
        }).runAsync();
      },
    });

    const scheduleBaseTypes =
      readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('mcaComponents.baseTypes.schedule'),
      );
    await scheduler.scheduleTask({
      ...scheduleBaseTypes,
      id: 'update-basetypes',
      fn: async () => {
        McaBaseTypeScheduledTask.create({
          logger,
          mcaComponentsStore,
          config,
        }).runAsync();
      },
    });
  }

  async getMcaComponentsCount(request: {
    type: McaComponentType;
  }): Promise<number> {
    const count = await this.mcaComponentsStore.getMcaComponentsCount(
      request.type,
    );
    return count ?? 0;
  }

  async listMcaComponents(
    request: McaComponentListRequest,
  ): Promise<McaComponentListResult> {
    const offset = request.offset ?? 0;
    const limit = request.limit ?? 20;
    return await this.mcaComponentsStore.getMcaComponents(
      offset,
      limit,
      request.type,
      request.orderBy,
      request.search,
    );
  }

  async getMcaComponent(request: {
    component: string;
  }): Promise<McaComponent | undefined> {
    return this.mcaComponentsStore.getMcaComponent(request.component);
  }

  async getMcaVersions(): Promise<McaVersions> {
    const versions = await this.mcaComponentsStore.getMcaVersions();
    return versions ?? DEFAULT_MCA_VERSIONS;
  }

  async listMcaBaseTypes(
    request: McaBaseTypeListRequest,
  ): Promise<McaBaseTypeListResult> {
    const offset = request.offset ?? 0;
    const limit = request.limit ?? 20;
    return this.mcaComponentsStore.getMcaBaseTypes(
      offset,
      limit,
      request.orderBy,
      request.search,
    );
  }

  async getMcaBaseTypesCount(): Promise<number> {
    return (await this.mcaComponentsStore.getMcaBaseTypesCount()) ?? 0;
  }

  async getMcaBaseType(request: {
    baseType: string;
  }): Promise<McaBaseType | undefined> {
    return this.mcaComponentsStore.getMcaBaseType(request.baseType);
  }
}

export const mcaComponentServiceRef = createServiceRef<McaService>({
  id: 'mca.component.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        logger: coreServices.logger,
        mcaComponentsStore: mcaComponentStoreServiceRef,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
      },
      async factory({ logger, mcaComponentsStore, config, scheduler }) {
        const mcaComponentService = new McaComponentService({
          logger,
          mcaComponentsStore,
          config,
          scheduler,
        });
        return mcaComponentService;
      },
    }),
});

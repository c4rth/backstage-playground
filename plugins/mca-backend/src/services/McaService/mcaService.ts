import { LoggerService, readSchedulerServiceTaskScheduleDefinitionFromConfig, SchedulerService } from "@backstage/backend-plugin-api";
import { McaBaseTypeListRequest, McaComponentListRequest, McaService } from "./types";
import { McaComponentsStore } from "../../database/mcaComponentStore";
import { McaBaseType, McaBaseTypeListResult, McaComponent, McaComponentListResult, McaComponentType, McaVersions } from '@internal/plugin-mca-common';
import { Config } from "@backstage/config";
import { McaOperationScheduledTask, McaBaseTypeScheduledTask } from "../../task";

export interface McaServiceOptions {
  logger: LoggerService;
  mcaComponentsStore: McaComponentsStore;
  scheduler: SchedulerService;
  config: Config;
}

const DEFAULT_MCA_VERSIONS: McaVersions = {
  p1Version: 'P+1',
  p2Version: 'P+2',
  p3Version: 'P+3',
  p4Version: 'P+4',
};

export async function mcaService(options: McaServiceOptions): Promise<McaService> {
  const { logger, mcaComponentsStore, scheduler, config } = options;

  logger.info('Initializing McaService');

  const scheduleOperations = readSchedulerServiceTaskScheduleDefinitionFromConfig(config.getConfig('mcaComponents.operations.schedule'));
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
  },);

  const scheduleBaseTypes = readSchedulerServiceTaskScheduleDefinitionFromConfig(config.getConfig('mcaComponents.baseTypes.schedule'));
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
  },);

  return {
    async getMcaComponentsCount(request: { type: McaComponentType }): Promise<number> {
      const count = await mcaComponentsStore.getMcaComponentsCount(request.type);
      return count ?? 0;
    },

    async listMcaComponents(request: McaComponentListRequest): Promise<McaComponentListResult> {
      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      return await mcaComponentsStore.getMcaComponents(offset, limit, request.type, request.orderBy, request.search);
    },

    async getMcaComponent(request: { component: string }): Promise<McaComponent | undefined> {
      return mcaComponentsStore.getMcaComponent(request.component);
    },

    async getMcaVersions(): Promise<McaVersions> {
      const versions = await mcaComponentsStore.getMcaVersions();
        return versions ?? DEFAULT_MCA_VERSIONS;
    },

    async listMcaBaseTypes(request: McaBaseTypeListRequest): Promise<McaBaseTypeListResult> {
      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      return mcaComponentsStore.getMcaBaseTypes(offset, limit, request.orderBy, request.search);
    },

    async getMcaBaseTypesCount(): Promise<number> {
      return (await mcaComponentsStore.getMcaBaseTypesCount()) ?? 0;
    },

    async getMcaBaseType(request: { baseType: string }): Promise<McaBaseType | undefined> {
      return mcaComponentsStore.getMcaBaseType(request.baseType);
    },

  };

}
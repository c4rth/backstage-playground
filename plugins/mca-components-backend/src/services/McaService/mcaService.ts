import { LoggerService, readSchedulerServiceTaskScheduleDefinitionFromConfig, SchedulerService } from "@backstage/backend-plugin-api";
import { McaBaseTypeListRequest, McaComponentListRequest, McaService } from "./types";
import { McaComponentsStore } from "../../database/mcaComponentStore";
import { McaBaseType, McaBaseTypeListResult, McaComponent, McaComponentListResult, McaComponentType, McaVersions } from "@internal/plugin-mca-components-common";
import { Config } from "@backstage/config";
import { McaOperationScheduledTask, McaBaseTypeScheduledTask } from "../../task";

export interface McaServiceOptions {
  logger: LoggerService;
  mcaComponentsStore: McaComponentsStore;
  scheduler: SchedulerService;
  config: Config;
}


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
      const res = await mcaComponentsStore.getMcaComponentsCount(request.type);
      if (res) {
        return res;
      }
      return 0;
    },

    async listMcaComponents(request: McaComponentListRequest): Promise<McaComponentListResult> {
      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      return await mcaComponentsStore.getMcaComponents(offset, limit, request.type, request.orderBy, request.search);
    },

    async getMcaComponent(request: { component: string }): Promise<McaComponent | undefined> {
      const { component } = request;
      const res = await mcaComponentsStore.getMcaComponent(component);
      if (res) {
        return res;
      }
      return undefined;
    },

    async getMcaVersions(): Promise<McaVersions> {
      const res = await mcaComponentsStore.getMcaVersions();
      if (res) {
        return res;
      }
      return {
        p1Version: 'P+1',
        p2Version: 'P+2',
        p3Version: 'P+3',
        p4Version: 'P+4',
      }
    },

    async listMcaBaseTypes(request: McaBaseTypeListRequest): Promise<McaBaseTypeListResult> {
      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      return await mcaComponentsStore.getMcaBaseTypes(offset, limit, request.orderBy, request.search);
    },

    async getMcaBaseTypesCount(): Promise<number> {
      const res = await mcaComponentsStore.getMcaBaseTypesCount();
      if (res) {
        return res;
      }
      return 0;
    },

    async getMcaBaseType(request: { baseType: string }): Promise<McaBaseType | undefined> {
      const { baseType } = request;
      const res = await mcaComponentsStore.getMcaBaseType(baseType);
      if (res) {
        return res;
      }
      return undefined;
    },

  };

}
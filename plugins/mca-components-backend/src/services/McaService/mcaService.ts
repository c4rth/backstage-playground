import { LoggerService } from "@backstage/backend-plugin-api";
import { McaComponentListRequest, McaService } from "./types";
import { McaComponentsStore } from "../../database/mcaComponentStore";
import { McaComponent, McaComponentListResult, McaComponentType, McaVersions } from "@internal/plugin-mca-components-common";

export interface McaServiceOptions {
  logger: LoggerService;
  mcaComponentsStore: McaComponentsStore;
}

export async function mcaService(options: McaServiceOptions): Promise<McaService> {
  const { logger, mcaComponentsStore } = options;

  logger.info('Initializing McaService');

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
      };
    }
  };

}
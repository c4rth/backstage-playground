import { LoggerService } from "@backstage/backend-plugin-api";
import { McaComponentListRequest, McaService } from "./types";
import { McaComponentsStore } from "../../database/mcaComponentStore";
import { McaComponent, McaComponentListResult } from "@internal/plugin-mca-components-common";

export interface McaServiceOptions {
  logger: LoggerService;
  mcaComponentsStore: McaComponentsStore;
}

export async function mcaService(options: McaServiceOptions): Promise<McaService> {
  const { logger, mcaComponentsStore } = options;

  logger.info('Initializing McaService');


  return {
    async getMcaComponentsCount(): Promise<number> {
      const res = await mcaComponentsStore.getMcaComponentsCount();
      if (res) {
        return res;
      }
      return 0;
    },

    async listMcaComponents(request: McaComponentListRequest): Promise<McaComponentListResult> {
      const offset = request.offset ?? 0;
      const limit = request.limit ?? 20;
      return await mcaComponentsStore.getMcaComponents(offset, limit, request.orderBy, request.search);
    },

    async getMcaComponent(request: { component: string }): Promise<McaComponent | undefined> {
      const { component } = request;
      const res = await mcaComponentsStore.getMcaComponent(component);
      if (res) {
        return res;
      }
      return undefined;

    }
  };

}
import { SystemDefinition } from "@internal/plugin-api-platform-common";

export interface SystemPlatformService {

  listSystems(): Promise<{ items: any[] }>;

  getSystem(request: { systemName: string }): Promise<SystemDefinition>;
  
}

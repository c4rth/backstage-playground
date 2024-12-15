import { ApiVersionDefinition } from "@internal/plugin-api-platform-common";

export interface ApiDefinitionService {

  listApiDefinitions(): Promise<{ items: any[] }>;

  getApiDefinitionVersions(request: { id: string }): Promise<ApiVersionDefinition[]>;
}

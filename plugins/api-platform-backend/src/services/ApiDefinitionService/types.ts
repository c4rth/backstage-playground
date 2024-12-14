import { ApiDefinition } from '@internal/plugin-api-platform-common';

export interface ApiDefinitionService {

  listApiDefinitions(): Promise<{ items: ApiDefinition[] }>;

  getApiDefinition(request: { id: string }): Promise<ApiDefinition>;
}

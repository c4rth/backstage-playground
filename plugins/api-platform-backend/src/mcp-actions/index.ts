import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { AuthService } from '@backstage/backend-plugin-api';

import { LoggerService } from '@backstage/backend-plugin-api';
import { registerApisMcpActions } from './registerApisMcpActions';
import { registerServicesMcpActions } from './registerServicesMcpActions';
import { registerSystemsMcpActions } from './registerSystemsMcpActions';
import { SystemService } from '../services/SystemService';
import { ServiceService } from '../services/ServiceService';
import { ApiService } from '../services/ApiService';

export function registerMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  auth: AuthService;
  catalog: CatalogService;
  systemService: SystemService;
  serviceService: ServiceService;
  apiService: ApiService;
}) {
  registerApisMcpActions(options);
  registerServicesMcpActions(options);
  registerSystemsMcpActions(options);
}

import { ActionsRegistryService } from '@backstage/backend-plugin-api/alpha';
import { McaService } from '../services';

import { LoggerService } from '@backstage/backend-plugin-api';
import { registerMcaBasetypeMcpActions } from './registerMcaBasetypeMcpActions';
import { registerMcaComponentMcpActions } from './registerMcaComponentMcpActions';

export function registerMcpActions(options: {
  actionsRegistry: ActionsRegistryService;
  logger: LoggerService;
  mcaService: McaService;
}) {
  registerMcaBasetypeMcpActions(options);
  registerMcaComponentMcpActions(options);
}

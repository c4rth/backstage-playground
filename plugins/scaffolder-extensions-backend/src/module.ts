import {
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createDebugXLogAction } from './actions/debugx';


export const scaffolderCustomModule = createBackendModule({
  moduleId: 'custom-extensions',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolderActions }) {
        scaffolderActions.addActions(
            createDebugXLogAction(),
        );
      },
    });
  },
});
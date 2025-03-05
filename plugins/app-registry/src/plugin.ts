import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { appRegistryBackendApiRef, AppRegistryBackendClient } from './api';

import { rootRouteRef } from './routes';

export const appRegistryPlugin = createPlugin({
  id: 'app-registry',
  apis: [
    createApiFactory({
      api: appRegistryBackendApiRef,
      deps: { configApi: configApiRef, fetchApi: fetchApiRef },
      factory: ({ configApi, fetchApi }) =>
        new AppRegistryBackendClient({ configApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const AppRegistryPage = appRegistryPlugin.provide(
  createComponentExtension({
    name: 'AppRegistryPage',
    component: {
      lazy: () =>
        import('./components/AppRegistryPage').then(m => m.AppRegistryPage),
    },
  }),
);
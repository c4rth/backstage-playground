import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  fetchApiRef,
  featureFlagsApiRef,
} from '@backstage/core-plugin-api';
import { appRegistryBackendApiRef, AppRegistryBackendClient } from './api';
import { rootRouteRef } from './routes';

export const appRegistryPlugin = createPlugin({
  id: 'app-registry',
  apis: [
    createApiFactory({
      api: appRegistryBackendApiRef,
      deps: {
        configApi: configApiRef,
        fetchApi: fetchApiRef,
        featureFlagsApi: featureFlagsApiRef,
      },
      factory: ({ configApi, fetchApi, featureFlagsApi }) =>
        new AppRegistryBackendClient({ configApi, fetchApi, featureFlagsApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
  featureFlags: [
    {
      name: 'mock-app-registry',
    },
  ],
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

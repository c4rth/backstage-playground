import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { ApiPlatformClient, apiPlatformApiRef } from './api';
import { rootRouteRef } from './routes';

export const apiPlatformPlugin = createPlugin({
  id: 'api-platform',
  apis: [
    createApiFactory({
      api: apiPlatformApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new ApiPlatformClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const ApiPlatformPage = apiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'ApiPlatformPage',
    component: () =>
      import('./components/ApiPlatformExplorerPage').then(m => m.ApiPlatformExplorerPage),
    mountPoint: rootRouteRef,
  }),
);

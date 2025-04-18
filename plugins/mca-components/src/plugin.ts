import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { mcaComponentsBackendApiRef, McaComponentsBackendClient } from './api/McaComponentsBackendApi';

export const mcaComponentPlugin = createPlugin({
  id: 'mca-components',
  apis: [
    createApiFactory({
      api: mcaComponentsBackendApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef, configApi: configApiRef, },
      factory: ({ discoveryApi, fetchApi, configApi }) =>
        new McaComponentsBackendClient({ discoveryApi, fetchApi, configApi }),
    }),
  ],
});

export const McaComponentExplorerPage = mcaComponentPlugin.provide(
  createRoutableExtension({
    name: 'McaComponentExplorerPage',
    component: () =>
      import('../../mca-components/src/components/McaComponentExplorerPage').then(m => m.McaComponentExplorerPage),
    mountPoint: rootRouteRef,
  }),
);

export const McaComponentDefinitionPage = mcaComponentPlugin.provide(
  createComponentExtension({
    name: 'McaComponentDefinitionPage',
    component: {
      lazy: () =>
        import('../../mca-components/src/components/McaComponentDefinitionPage').then(m => m.McaComponentDefinitionPage),
    }
  }),
);

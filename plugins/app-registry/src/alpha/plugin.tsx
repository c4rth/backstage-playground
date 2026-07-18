import { RiApps2Line } from '@remixicon/react';
import {
  ApiBlueprint,
  PageBlueprint,
  configApiRef,
  createFrontendPlugin,
  featureFlagsApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { AppRegistryBackendClient, appRegistryBackendApiRef } from '../api';
import { rootRouteRef } from '../routes';

/** @alpha */
const appRegistryPage = PageBlueprint.make({
  name: 'app-registry',
  params: {
    path: '/app-registry',
    routeRef: rootRouteRef,
    loader: () =>
      import('../components/AppRegistryPage').then(m => <m.AppRegistryPage />),
  },
});

const appRegistryApi = ApiBlueprint.make({
  name: 'app-registry-backend-api',
  params: defineParams =>
    defineParams({
      api: appRegistryBackendApiRef,
      deps: {
        configApi: configApiRef,
        fetchApi: fetchApiRef,
        featureFlagsApi: featureFlagsApiRef,
      },
      factory: ({ configApi, fetchApi, featureFlagsApi }) =>
        new AppRegistryBackendClient({ configApi, fetchApi, featureFlagsApi }),
    }),
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'app-registry',
  title: 'App Registry',
  icon: <RiApps2Line />,
  routes: {
    root: rootRouteRef,
  },
  featureFlags: [
    {
      name: 'mock-app-registry',
    },
  ],
  extensions: [appRegistryPage, appRegistryApi],
});

import { RiApps2Line } from '@remixicon/react';
import {
  ApiBlueprint,
  PageBlueprint,
  configApiRef,
  createFrontendPlugin,
  featureFlagsApiRef,
  fetchApiRef,
  translationApiRef,
} from '@backstage/frontend-plugin-api';
import { AppRegistryBackendClient, appRegistryBackendApiRef } from './api';
import { rootRouteRef } from './routes';
import { appRegistryMetadata } from './translation';

/** @alpha */
const appRegistryPage = PageBlueprint.make({
  name: 'app-registry',
  params: {
    path: '/app-registry',
    routeRef: rootRouteRef,
    loader: () =>
      import('./components/AppRegistryPage').then(m => <m.AppRegistryPage />),
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
        translationApi: translationApiRef,
      },
      factory: ({ configApi, fetchApi, featureFlagsApi, translationApi }) =>
        new AppRegistryBackendClient({
          configApi,
          fetchApi,
          featureFlagsApi,
          translationApi,
        }),
    }),
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'app-registry',
  title: appRegistryMetadata.title,
  icon: <RiApps2Line />,
  routes: {
    root: rootRouteRef,
  },
  featureFlags: [
    {
      name: 'mock-app-registry',
      description: appRegistryMetadata.mockDescription,
    },
  ],
  extensions: [appRegistryPage, appRegistryApi],
});

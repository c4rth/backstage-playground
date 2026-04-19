import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  fetchApiRef,
  featureFlagsApiRef,
} from '@backstage/core-plugin-api';
import {
  healthDashboardBackendApiRef,
  HealthDashboardBackendClient,
} from './api';
import { rootRouteRef } from './routes';

export const healthDashboardPlugin = createPlugin({
  id: 'health-dashboard',
  apis: [
    createApiFactory({
      api: healthDashboardBackendApiRef,
      deps: {
        configApi: configApiRef,
        fetchApi: fetchApiRef,
        featureFlagsApi: featureFlagsApiRef,
      },
      factory: ({ configApi, fetchApi, featureFlagsApi }) =>
        new HealthDashboardBackendClient({
          configApi,
          fetchApi,
          featureFlagsApi,
        }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
  featureFlags: [
    {
      name: 'mock-health-dashboard',
    },
  ],
});

export const HealthDashboardPage = healthDashboardPlugin.provide(
  createComponentExtension({
    name: 'HealthDashboardPage',
    component: {
      lazy: () =>
        import('./components/HealthDashboardPage').then(
          m => m.HealthDashboardPage,
        ),
    },
  }),
);

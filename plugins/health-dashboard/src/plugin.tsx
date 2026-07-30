import {
  ApiBlueprint,
  PageBlueprint,
  configApiRef,
  createFrontendPlugin,
  featureFlagsApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { RiHeartPulseFill } from '@remixicon/react';
import {
  HealthDashboardBackendClient,
  healthDashboardBackendApiRef,
} from './api';
import { rootRouteRef } from './routes';

const healthDashboardPage = PageBlueprint.make({
  name: 'health-dashboard',
  params: {
    noHeader: true,
    path: '/health-dashboard',
    icon: <RiHeartPulseFill fontSize="inherit" />,
    title: 'Health Dashboard',
    routeRef: rootRouteRef,
    loader: () =>
      import('./components/HealthDashboardPage').then(m => (
        <m.HealthDashboardPage />
      )),
  },
});

const healthDashboardApi = ApiBlueprint.make({
  name: 'health-dashboard-backend-api',
  params: defineParams =>
    defineParams({
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
});

export default createFrontendPlugin({
  pluginId: 'health-dashboard',
  title: 'Health Dashboard',
  routes: {
    root: rootRouteRef,
  },
  featureFlags: [
    {
      name: 'mock-health-dashboard',
      description: 'Enable the mock health dashboard endpoint for testing purposes',
    },
  ],
  extensions: [healthDashboardPage, healthDashboardApi],
});

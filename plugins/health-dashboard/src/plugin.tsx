import {
  ApiBlueprint,
  PageBlueprint,
  SubPageBlueprint,
  configApiRef,
  createFrontendPlugin,
  featureFlagsApiRef,
  fetchApiRef,
  createRouteRef,
} from '@backstage/frontend-plugin-api';
import { RiHeartPulseFill } from '@remixicon/react';
import {
  HealthDashboardBackendClient,
  healthDashboardBackendApiRef,
} from './api';
import { healthDashboardsRouteRef } from './routes';

const healthProveV1RouteRef = createRouteRef();
const healthProveV2RouteRef = createRouteRef();

const healthDashboardsPage = PageBlueprint.make({
  name: 'dashboard-explorer',
  params: {
    icon: <RiHeartPulseFill fontSize="inherit" />,
    title: 'Health Dashboards',
    path: '/health-dashboards',
    routeRef: healthDashboardsRouteRef,
  },
});

const healthDashboardV1Page = SubPageBlueprint.make({
  name: 'health-dashboard-v1',
  attachTo: { id: 'page:health-dashboards/dashboard-explorer', input: 'pages' },
  params: {
    path: 'v1',
    routeRef: healthProveV1RouteRef,
    title: 'Health Dashboards V1',
    loader: () =>
      import('./components/HealthDashboardV1Page').then(m => (
        <m.HealthDashboardV1Page />
      )),
  },
});

const healthDashboardV2Page = SubPageBlueprint.make({
  name: 'health-dashboard-v2',
  attachTo: { id: 'page:health-dashboards/dashboard-explorer', input: 'pages' },
  params: {
    path: 'v2',
    routeRef: healthProveV2RouteRef,
    title: 'Health Dashboards V2',
    loader: () =>
      import('./components/HealthDashboardV2Page').then(m => (
        <m.HealthDashboardV2Page />
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
  pluginId: 'health-dashboards',
  title: 'Health Dashboards',
  routes: {
    healthDashboards: healthDashboardsRouteRef,
  },
  featureFlags: [
    {
      name: 'mock-health-dashboard',
      description:
        'Enable the mock health dashboard endpoint for testing purposes',
    },
  ],
  extensions: [
    healthDashboardsPage,
    healthDashboardV1Page,
    healthDashboardV2Page,
    healthDashboardApi,
  ],
});

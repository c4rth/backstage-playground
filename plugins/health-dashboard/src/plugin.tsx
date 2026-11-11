import {
  ApiBlueprint,
  PageBlueprint,
  SubPageBlueprint,
  configApiRef,
  createFrontendPlugin,
  featureFlagsApiRef,
  fetchApiRef,
  createRouteRef,
  translationApiRef,
} from '@backstage/frontend-plugin-api';
import { RiHeartPulseFill } from '@remixicon/react';
import {
  HealthDashboardBackendClient,
  healthDashboardBackendApiRef,
} from './api';
import { healthDashboardsRouteRef } from './routes';
import { healthDashboardMetadata } from './translation';

const healthProveV1RouteRef = createRouteRef();
const healthProveV2RouteRef = createRouteRef();

const healthDashboardsPage = PageBlueprint.make({
  name: 'dashboard-explorer',
  params: {
    icon: <RiHeartPulseFill fontSize="inherit" />,
    title: healthDashboardMetadata.title,
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
    title: healthDashboardMetadata.v1Title,
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
    title: healthDashboardMetadata.v2Title,
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
        translationApi: translationApiRef,
      },
      factory: ({ configApi, fetchApi, featureFlagsApi, translationApi }) =>
        new HealthDashboardBackendClient({
          configApi,
          fetchApi,
          featureFlagsApi,
          translationApi,
        }),
    }),
});

export default createFrontendPlugin({
  pluginId: 'health-dashboards',
  title: healthDashboardMetadata.title,
  routes: {
    healthDashboards: healthDashboardsRouteRef,
  },
  featureFlags: [
    {
      name: 'mock-health-dashboard',
      description: healthDashboardMetadata.mockDescription,
    },
  ],
  extensions: [
    healthDashboardsPage,
    healthDashboardV1Page,
    healthDashboardV2Page,
    healthDashboardApi,
  ],
});

import {
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { AnalyticsBackendApi, analyticsBackendApiRef } from '../api';

const analyticsApi = ApiBlueprint.make({
  name: 'analytics-backend-api',
  params: defineParams =>
    defineParams({
      api: analyticsBackendApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new AnalyticsBackendApi({ discoveryApi, fetchApi }),
    }),
});

export default createFrontendPlugin({
  pluginId: 'analytics',
  title: 'Analytics',
  extensions: [analyticsApi],
});

export { AnalyticsContent } from '../plugin';
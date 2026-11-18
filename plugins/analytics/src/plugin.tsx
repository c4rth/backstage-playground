import {
  ApiBlueprint,
  createFrontendPlugin,
  coreApis,
} from '@backstage/frontend-plugin-api';
import { AnalyticsBackendApi, analyticsBackendApiRef } from './api';
import { analyticsMetadata } from './translation';

const analyticsApi = ApiBlueprint.make({
  name: 'analytics-backend-api',
  params: defineParams =>
    defineParams({
      api: analyticsBackendApiRef,
      deps: {
        discoveryApi: coreApis.discovery,
        fetchApi: coreApis.fetch,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new AnalyticsBackendApi({ discoveryApi, fetchApi }),
    }),
});

export default createFrontendPlugin({
  pluginId: 'analytics',
  title: analyticsMetadata.title,
  extensions: [analyticsApi],
});

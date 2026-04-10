import {
  createApiFactory,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { analyticsBackendApiRef, AnalyticsBackendClient } from './api/AnalyticsBackendApi';

export const analyticsComponentPlugin = createPlugin({
  id: 'analytics',
  apis: [
    createApiFactory({
      api: analyticsBackendApiRef,
      deps: { 
        discoveryApi: discoveryApiRef, 
        fetchApi: fetchApiRef, 
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new AnalyticsBackendClient({ discoveryApi, fetchApi }),
    }),
  ],
});

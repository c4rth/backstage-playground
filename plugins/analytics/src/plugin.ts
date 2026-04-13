import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { AnalyticsBackendApi, analyticsBackendApiRef } from './api';

export const analyticsPlugin = createPlugin({
  id: 'plugin.custom-analytics.backend',
  apis: [
    createApiFactory({
      api: analyticsBackendApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new AnalyticsBackendApi({ discoveryApi, fetchApi }),
    }),
  ],
});


export const AnalyticsContent = analyticsPlugin.provide(
  createComponentExtension({
    name: 'AnalyticsContent',
    component: {
      lazy: () =>
        import('./components/AnalyticsContent').then(m => m.AnalyticsContent),
    },
  }),
);
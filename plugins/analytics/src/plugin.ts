import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { analyticsBackendApiRef, CustomAnalyticsApi } from './api';

export const analyticsPlugin = createPlugin({
  id: 'analytics.custom-analytics',
  apis: [
    createApiFactory({
      api: analyticsBackendApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new CustomAnalyticsApi({ discoveryApi, fetchApi }),
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
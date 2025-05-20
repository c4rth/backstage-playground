import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const apiSwaggerDocsPlugin = createPlugin({
  id: 'api-swagger-docs',
  routes: {
    root: rootRouteRef,
  },
});

//-------------------------------------------------------------------------------------------------

export const OpenApiDefinitionWidget = apiSwaggerDocsPlugin.provide(
  createComponentExtension({
    name: 'OpenApiDefinitionWidget',
    component: {
      lazy: () =>
        import('./components/OpenApiDefinitionWidget').then(m => m.OpenApiDefinitionWidget),
    },
  }),
);
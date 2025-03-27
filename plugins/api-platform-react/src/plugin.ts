import {
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const apiPlatformReactPlugin = createPlugin({
  id: 'api-platform-react',
  routes: {
    root: rootRouteRef,
  },
});

export const InfoPopover = apiPlatformReactPlugin.provide(
  createComponentExtension({
    name: 'ApiPlatformDefinitionPage',
    component: {
      lazy: () =>
        import('./components/InfoPopover').then(m => m.InfoPopover),
    },
  }),
);

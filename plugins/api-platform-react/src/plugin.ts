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
    name: 'InfoPopover',
    component: {
      lazy: () =>
        import('./components/InfoPopover').then(m => m.InfoPopover),
    },
  }),
);

export const InfoPopUp = apiPlatformReactPlugin.provide(
  createComponentExtension({
    name: 'InfoPopUp',
    component: {
      lazy: () =>
        import('./components/InfoPopUp').then(m => m.InfoPopUp),
    },
  }),
);


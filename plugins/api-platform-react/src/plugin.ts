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

export const InfoPopOver = apiPlatformReactPlugin.provide(
  createComponentExtension({
    name: 'InfoPopOver',
    component: {
      lazy: () =>
        import('./components/InfoPopOver').then(m => m.InfoPopOver),
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
import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const toolkitPlugin = createPlugin({
  id: 'toolkit',
  routes: {
    root: rootRouteRef,
  },
});

//-------------------------------------------------------------------------------------------------

export const ToolkitCard = toolkitPlugin.provide(
  createComponentExtension({
    name: 'ToolkitCard',
    component: {
      lazy: () =>
        import('./components/ToolkitCard').then(m => m.ToolkitCard),
    },
  }),
);
import {
  createPlugin,
  createComponentExtension,
  createRoutableExtension,
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
        import('./components/ToolkitCard/ToolkitCard').then(m => m.ToolkitCard),
    },
  }),
);

//-------------------------------------------------------------------------------------------------

export const ToolsPage = toolkitPlugin.provide(
 createRoutableExtension({
    name: 'ToolsPage',
    component: () =>
      import('./components/ToolsPage').then(m => m.ToolsPage),
    mountPoint: rootRouteRef,
  }),
);

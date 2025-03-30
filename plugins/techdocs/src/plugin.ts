import {
  createPlugin,
  createComponentExtension,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootDocsRouteRef } from './routes';

export const externalDocsPlugin = createPlugin({
  id: 'external-docs',
  routes: {
    root: rootDocsRouteRef,
  },
});

//-------------------------------------------------------------------------------------------------

export const CustomDocsReaderPage = externalDocsPlugin.provide(
  createComponentExtension({
    name: 'CustomDocsReaderPage',
    component: {
      lazy: () =>
        import('./components/CustomDocsReaderPage').then(m => m.CustomDocsReaderPage),
    },
  }),
);

//-------------------------------------------------------------------------------------------------

export const TechDocsHome =
externalDocsPlugin.provide(
      createRoutableExtension({
        name: 'TechDocsHome',
        component: () =>
          import('./components/TechDocsHome').then(
            m => m.TechDocsHome,
          ),
        mountPoint: rootDocsRouteRef,
      }),
    );

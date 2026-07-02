import {
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const catalogAdminPlugin = createPlugin({
  id: 'catalog-admin',
  apis: [],
  routes: {
    root: rootRouteRef,
  },
});

export const CatalogAdminPage = catalogAdminPlugin.provide(
  createComponentExtension({
    name: 'CatalogAdminPage',
    component: {
      lazy: () =>
        import('./components/CatalogAdminPage').then(m => m.CatalogAdminPage),
    },
  }),
);

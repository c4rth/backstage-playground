import {
  createFrontendPlugin,
  SubPageBlueprint,
} from '@backstage/frontend-plugin-api';
import { ExternalDependenciesContent } from '@backstage/plugin-devtools';
import { AnalyticsContent } from '@internal/plugin-analytics';
import { CatalogAdminPage } from '@internal/plugin-catalog-admin';
import { Box } from '@backstage/ui';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';

export const externalDependenciesDevTools = SubPageBlueprint.make({
  name: 'external-dependencies',
  attachTo: { id: 'page:devtools', input: 'pages' },
  params: {
    path: 'external-dependencies',
    title: 'External Dependencies',
    loader: async () => {
      return (
        <RequirePermission permission={devToolsAdministerPermission}>
          <Box m="4">
            <ExternalDependenciesContent />
          </Box>
        </RequirePermission>
      );
    },
  },
});

export const analyticsDevTools = SubPageBlueprint.make({
  name: 'analytics',
  attachTo: { id: 'page:devtools', input: 'pages' },
  params: {
    path: 'analytics',
    title: 'Analytics',
    loader: async () => {
      return (
        <RequirePermission permission={devToolsAdministerPermission}>
          <AnalyticsContent />
        </RequirePermission>
      );
    },
  },
});

export const catalogAdminDevTools = SubPageBlueprint.make({
  name: 'catalog-admin',
  attachTo: { id: 'page:devtools', input: 'pages' },
  params: {
    path: 'catalog-admin',
    title: 'Catalog Admin',
    loader: async () => {
      return (
        <RequirePermission permission={devToolsAdministerPermission}>
          <CatalogAdminPage />
        </RequirePermission>
      );
    },
  },
});

export const devToolsExtensionPlugin = createFrontendPlugin({
  pluginId: 'devtools-extensions',
  extensions: [
    externalDependenciesDevTools,
    analyticsDevTools,
    catalogAdminDevTools,
  ],
});

import React from 'react';
import { Route } from 'react-router-dom';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import {
  DefaultTechDocsHome,
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInPage,
} from '@backstage/core-components';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { taskCreatePermission } from '@backstage/plugin-scaffolder-common/alpha';
// Theme
import { carthThemes } from './themes/carthTheme';
// Home
import { HomepageCompositionRoot, VisitListener } from '@backstage/plugin-home';
import { HomePage } from './components/home/HomePage';
// Identity Providers
import { providers } from './identityProviders';
// Plugins
import * as plugins from './plugins';
// Notifications
import { NotificationsPage } from '@backstage/plugin-notifications';
// Auto-logout
import { AutoLogout } from '@backstage/core-components';
// Entity Validation
import { EntityValidationPage } from '@backstage-community/plugin-entity-validation';
// API platform
import {
  ApiPlatformDefinitionPage,
  ApiPlatformExplorerPage,
  ServicePlatformExplorerPage,
  ServicePlatformDefinitionPage,
  SystemPlatformExplorerPage,
  SystemPlatformDefinitionPage,
} from '@internal/plugin-api-platform';
import { toolsReadPermission } from '@internal/plugin-api-platform-common';
// Mermaid
import { Mermaid } from 'backstage-plugin-techdocs-addon-mermaid';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
// Kiali
import { KialiPage } from '@backstage-community/plugin-kiali';

const app = createApp({
  apis,
  plugins: Object.values(plugins),
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
  components: {
    SignInPage: props => (
      <SignInPage
        {...props}
        providers={['guest', ...providers]}
        title="Select a sign-in method"
        align="center"
      />
    ),
  },
  themes: carthThemes,
});

const routes = (
  <FlatRoutes>
    <Route path="/" element={<HomepageCompositionRoot />}>
      <HomePage />
    </Route>
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />}>
      <DefaultTechDocsHome />
    </Route>
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}>
      <TechDocsAddons>
        <Mermaid />
      </TechDocsAddons>
    </Route>
    <Route
      path="/create"
      element={
        <RequirePermission permission={taskCreatePermission}>
          <ScaffolderPage />
        </RequirePermission>
      }
    />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <RequirePermission permission={toolsReadPermission}>
      <Route path="/kiali" element={<KialiPage />} />
    </RequirePermission>
    <RequirePermission permission={catalogEntityCreatePermission}>
      <Route path="/entity-validation" element={<EntityValidationPage />} />
    </RequirePermission>
    <Route path="/api-platform/api" element={<ApiPlatformExplorerPage />} />
    <Route path="/api-platform/api/:name" element={<ApiPlatformDefinitionPage />} />
    <Route path="/api-platform/service" element={<ServicePlatformExplorerPage />} />
    <Route path="/api-platform/service/:name" element={<ServicePlatformDefinitionPage />} />
    <Route path="/api-platform/system" element={<SystemPlatformExplorerPage />} />
    <Route path="/api-platform/system/:name" element={<SystemPlatformDefinitionPage />} />
    
  </FlatRoutes>
);

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AutoLogout />
    <AppRouter>
      <VisitListener />
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);

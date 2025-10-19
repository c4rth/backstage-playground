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
// Scaffolder
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { ScaffolderFieldExtensions } from '@backstage/plugin-scaffolder-react';
// Theme
import { carthThemes } from './themes/carthTheme';
// Home
import { HomepageCompositionRoot, VisitListener } from '@backstage/plugin-home';
import { HomePage } from './components/home/HomePage';
// Identity Providers
import { providers } from './identityProviders';
// Plugins
import * as plugins from './plugins';
// Auto-logout
import { AutoLogout } from '@backstage/core-components';
// Entity Validation
import { EntityValidationPage } from '@backstage-community/plugin-entity-validation';
// API platform
import {
  ApiPlatformDefinitionPage,
  ApiPlatformRedirectToNoSystem,
  ApiPlatformExplorerPage,
  ServicePlatformExplorerPage,
  ServicePlatformDefinitionPage,
  SystemPlatformExplorerPage,
  SystemPlatformDefinitionPage,
} from '@internal/plugin-api-platform';
import { CustomDocsReaderPage, TechDocsHome } from '@internal/plugin-techdocs';
import { McaBaseTypeDefinitionPage, McaComponentDefinitionPage, McaComponentExplorerPage, McaBaseTypeExplorerPage } from '@internal/plugin-mca';
import { adminToolsPermission, notGuestPermission } from '@internal/plugin-permissions-common';
// TechDocs
import { Mermaid } from '@internal/plugin-techdocs-addon-mermaid';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { DrawIo } from '@internal/plugin-techdocs-addon-drawio';
// DevTools
import { DevToolsPage } from '@backstage/plugin-devtools';
import { customDevToolsPage } from './components/devtools/CustomDevToolsPage';
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';
import { CatalogUnprocessedEntitiesPage } from '@backstage/plugin-catalog-unprocessed-entities';
import { ToolsPage } from '@internal/plugin-toolkit';
import { ProjectPickerFieldExtension } from '@internal/plugin-scaffolder-extensions';
import { BuiThemerPage } from '@backstage/plugin-mui-to-bui';

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
      registerComponent: false,
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
        providers={providers}
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
    <Route path="/catalog" element={<CatalogIndexPage pagination />} />
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
        <DrawIo />
      </TechDocsAddons>
    </Route>
    <Route
      path="/external-docs"
      element={
        <TechDocsHome />
      }
    />
    <Route
      path="/external-docs/:namespace/:kind/:name/*"
      element={<CustomDocsReaderPage />} />
    <Route
      path="/create"
      element={
        <RequirePermission permission={taskCreatePermission}>
          <ScaffolderPage >
            <ScaffolderFieldExtensions>
              <ProjectPickerFieldExtension />
            </ScaffolderFieldExtensions>
          </ScaffolderPage>
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
    <Route
      path="/entity-validation"
      element={
        <RequirePermission permission={adminToolsPermission}>
          <EntityValidationPage />
        </RequirePermission>
      }
    />
    <Route path="/api-platform/api" element={<ApiPlatformExplorerPage />} />
    {/* For compatibility with old URLs */}
    <Route path="/api-platform/api/:name" element={<ApiPlatformRedirectToNoSystem />} />
    <Route path="/api-platform/api/:system/:name" element={<ApiPlatformDefinitionPage />} />
    <Route path="/api-platform/service" element={<ServicePlatformExplorerPage />} />
    <Route path="/api-platform/service/:system/:name" element={<ServicePlatformDefinitionPage />} />
    <Route path="/api-platform/system" element={<SystemPlatformExplorerPage />} />
    <Route path="/api-platform/system/:name" element={<SystemPlatformDefinitionPage />} />
    <Route path="/mca/components" element={<McaComponentExplorerPage />} />
    <Route path="/mca/components/:name" element={<McaComponentDefinitionPage />} />
    <Route path="/mca/basetypes" element={<McaBaseTypeExplorerPage />} />
    <Route path="/mca/basetypes/:name" element={<McaBaseTypeDefinitionPage />} />
    <Route path="/tools" element={
      <RequirePermission permission={notGuestPermission}>
        <ToolsPage />
      </RequirePermission>
    }
    />
    <Route path="/mui-to-bui" element={<BuiThemerPage />} />
    <Route path="/devtools"
      element={
        <RequirePermission permission={devToolsAdministerPermission}>
          <DevToolsPage />
        </RequirePermission>
      }>
      {customDevToolsPage}
    </Route>
    <Route
      path="/catalog-unprocessed-entities"
      element={<CatalogUnprocessedEntitiesPage />}
    />;
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

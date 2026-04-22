import { Route } from 'react-router-dom';
import {
  apiDocsPlugin,
  ApiExplorerPage as BackstageApiExplorerPage,
} from '@backstage/plugin-api-docs';
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
  ErrorPage,
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
  ApiDefinitionPage,
  ApiRedirectToNoSystem,
  ApiExplorerPage,
  ServiceExplorerPage,
  ServiceDefinitionPage,
  SystemExplorerPage,
  SystemDefinitionPage,
  LibraryExplorerPage,
  LibraryDefinitionPage,
} from '@internal/plugin-api-platform';
import { CustomDocsReaderPage, TechDocsHome } from '@internal/plugin-techdocs';
import {
  McaBaseTypeDefinitionPage,
  McaComponentDefinitionPage,
  McaComponentExplorerPage,
  McaBaseTypeExplorerPage,
} from '@internal/plugin-mca';
import {
  adminToolsPermission,
  healthDashboardPermission,
  notGuestPermission,
} from '@internal/plugin-permissions-common';
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
// Scaffolder Extensions
import { ProjectPickerFieldExtension, AlertMessageExtension } from '@internal/plugin-scaffolder-extensions';
import { HealthDashboardPage } from '@internal/plugin-health-dashboard';

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
  featureFlags: [
    {
      pluginId: 'api-platform',
      name: 'enable-api-platform-libraries',
      description: 'Enable API Platform libraries',
    },
  ],
});

const routes = (
  <FlatRoutes>
    <Route path="/" element={<HomepageCompositionRoot />}>
      <HomePage />
    </Route>
    <Route
      path="/catalog"
      element={
        <RequirePermission
          permission={notGuestPermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
          <CatalogIndexPage pagination />
        </RequirePermission>
      }
    />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={
        <RequirePermission
          permission={notGuestPermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
          <CatalogEntityPage />
        </RequirePermission>
      }
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />}>
      <DefaultTechDocsHome />
    </Route>
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <Mermaid />
        <DrawIo />
      </TechDocsAddons>
    </Route>
    <Route path="/external-docs" element={<TechDocsHome />} />
    <Route
      path="/external-docs/:namespace/:kind/:name/*"
      element={<CustomDocsReaderPage />}
    />
    <Route
      path="/create"
      element={
        <RequirePermission
          permission={taskCreatePermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
          <ScaffolderPage>
            <ScaffolderFieldExtensions>
              <ProjectPickerFieldExtension />
              <AlertMessageExtension />
            </ScaffolderFieldExtensions>
          </ScaffolderPage>
        </RequirePermission>
      }
    />
    <Route path="/api-docs" element={<BackstageApiExplorerPage />} />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission
          permission={catalogEntityCreatePermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
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
        <RequirePermission
          permission={adminToolsPermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
          <EntityValidationPage />
        </RequirePermission>
      }
    />
    <Route path="/api-platform/api" element={<ApiExplorerPage />} />
    {/* For compatibility with old URLs */}
    <Route path="/api-platform/api/:name" element={<ApiRedirectToNoSystem />} />
    <Route
      path="/api-platform/api/:system/:name"
      element={<ApiDefinitionPage />}
    />
    <Route path="/api-platform/service" element={<ServiceExplorerPage />} />
    <Route
      path="/api-platform/service/:system/:name"
      element={<ServiceDefinitionPage />}
    />
    <Route path="/api-platform/system" element={<SystemExplorerPage />} />
    <Route
      path="/api-platform/system/:name"
      element={<SystemDefinitionPage />}
    />
    <Route path="/api-platform/library" element={<LibraryExplorerPage />} />
    <Route
      path="/api-platform/library/:system/:name"
      element={<LibraryDefinitionPage />}
    />
    <Route path="/mca/components" element={<McaComponentExplorerPage />} />
    <Route
      path="/mca/components/:name"
      element={<McaComponentDefinitionPage />}
    />
    <Route path="/mca/basetypes" element={<McaBaseTypeExplorerPage />} />
    <Route
      path="/mca/basetypes/:name"
      element={<McaBaseTypeDefinitionPage />}
    />
    <Route
      path="/health-dashboard"
      element={
        <RequirePermission
          permission={healthDashboardPermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
          <HealthDashboardPage />
        </RequirePermission>
      }
    >
      {customDevToolsPage}
    </Route>
    <Route path="/tools" element={<ToolsPage />} />
    <Route
      path="/admin"
      element={
        <RequirePermission
          permission={devToolsAdministerPermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
          <DevToolsPage />
        </RequirePermission>
      }
    >
      {customDevToolsPage}
    </Route>
    <Route
      path="/catalog-unprocessed-entities"
      element={<CatalogUnprocessedEntitiesPage />}
    />
    ;
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

import { Route } from 'react-router-dom';
import {
  ApiExplorerPage as BackstageApiExplorerPage,
} from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
} from '@backstage/plugin-catalog-import';
import { SearchPage } from '@backstage/plugin-search';
import {
  DefaultTechDocsHome,
  TechDocsIndexPage,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { entityPage } from './modules/catalog/EntityPage';
import { searchPage } from './modules/search/SearchPage';

import {
  ErrorPage,
} from '@backstage/core-components';
import { FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { taskCreatePermission } from '@backstage/plugin-scaffolder-common/alpha';
// Scaffolder
import { ScaffolderPage } from '@backstage/plugin-scaffolder';
import { ScaffolderFieldExtensions } from '@backstage/plugin-scaffolder-react';
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
  LibraryDefinitionServicesPage,
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
  advancedUserPermission,
  notGuestPermission,
} from '@internal/plugin-permissions-common';
// TechDocs
import { Mermaid } from '@internal/plugin-techdocs-addon-mermaid';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { DrawIo } from '@internal/plugin-techdocs-addon-drawio';
// DevTools
import { DevToolsPage } from '@backstage/plugin-devtools';
import { customDevToolsPage } from './modules/devtools/CustomDevToolsPage';
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';
import { CatalogUnprocessedEntitiesPage } from '@backstage/plugin-catalog-unprocessed-entities';
import { ToolsPage } from '@internal/plugin-toolkit';
// Scaffolder Extensions
import {
  ProjectPickerFieldExtension,
  AlertMessageExtension,
} from '@internal/plugin-scaffolder-extensions';
import { HealthDashboardPage } from '@internal/plugin-health-dashboard';

export const routes = (
  <FlatRoutes>
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
    <Route
      path="/api-platform/library"
      element={
        <RequirePermission
          permission={advancedUserPermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
          <LibraryExplorerPage />
        </RequirePermission>
      }
    />
    <Route
      path="/api-platform/library/:system/:name"
      element={
        <RequirePermission
          permission={advancedUserPermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
          <LibraryDefinitionPage />
        </RequirePermission>
      }
    />
    <Route
      path="/api-platform/library/:system/:name/:version"
      element={
        <RequirePermission
          permission={advancedUserPermission}
          errorPage={<ErrorPage statusMessage="RBAC access denied" />}
        >
          <LibraryDefinitionServicesPage />
        </RequirePermission>
      }
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
    <Route path="/health-dashboard" element={<HealthDashboardPage />} />
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
  </FlatRoutes>
);
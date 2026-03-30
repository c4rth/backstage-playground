
import { Route } from 'react-router-dom';
import { ApiExplorerPage as BackstageApiExplorerPage } from '@backstage/plugin-api-docs';
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
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';

import { FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { taskCreatePermission } from '@backstage/plugin-scaffolder-common/alpha';
// Scaffolder
import { ScaffolderPage, } from '@backstage/plugin-scaffolder';
import { ScaffolderFieldExtensions } from '@backstage/plugin-scaffolder-react';
// Home
import { HomepageCompositionRoot, } from '@backstage/plugin-home';
import { HomePage } from './components/home/HomePage';
// Entity Validation
import { EntityValidationPage } from '@backstage-community/plugin-entity-validation';
// API platform
import {
  ApiDefinitionPage,
  ApiRedirectToNoSystem,
  ApiExplorerPage,
  ServicePlatformExplorerPage,
  ServicePlatformDefinitionPage,
  SystemPlatformExplorerPage,
  SystemPlatformDefinitionPage,
  LibraryExplorerPage,
  LibraryDefinitionPage,
} from '@internal/plugin-api-platform';
import { McaBaseTypeDefinitionPage, McaComponentDefinitionPage, McaComponentExplorerPage, McaBaseTypeExplorerPage } from '@internal/plugin-mca';
import { adminToolsPermission } from '@internal/plugin-permissions-common';
// TechDocs
import { Mermaid } from '@internal/plugin-techdocs-addon-mermaid';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { DrawIo } from '@internal/plugin-techdocs-addon-drawio';
// DevTools
import { DevToolsPage, devToolsPlugin } from '@backstage/plugin-devtools';
import { customDevToolsPage } from './components/devtools/CustomDevToolsPage';
import { devToolsAdministerPermission } from '@backstage/plugin-devtools-common';
import { CatalogUnprocessedEntitiesPage } from '@backstage/plugin-catalog-unprocessed-entities';
import { ToolsPage } from '@internal/plugin-toolkit';
// Scaffolder Extensions
import { ProjectPickerFieldExtension } from '@internal/plugin-scaffolder-extensions';
import { HealthDashboardPage } from '@internal/plugin-health-dashboard';

export const routes = (
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
    <Route path="/api-docs" element={<BackstageApiExplorerPage />} />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/catalog-unprocessed-entities" element={<CatalogUnprocessedEntitiesPage />} />
    <Route
      path="/entity-validation"
      element={
        <RequirePermission permission={adminToolsPermission}>
          <EntityValidationPage />
        </RequirePermission>
      }
    />
    <Route path="/settings" element={<UserSettingsPage />} />

    <Route path="/api-platform/api" element={<ApiExplorerPage />} />
    <Route path="/api-platform/api/:name" element={<ApiRedirectToNoSystem />} />
    <Route path="/api-platform/api/:system/:name" element={<ApiDefinitionPage />} />
    <Route path="/api-platform/service" element={<ServicePlatformExplorerPage />} />
    <Route path="/api-platform/service/:system/:name" element={<ServicePlatformDefinitionPage />} />
    <Route path="/api-platform/system" element={<SystemPlatformExplorerPage />} />
    <Route path="/api-platform/system/:name" element={<SystemPlatformDefinitionPage />} />
    <Route path="/api-platform/library" element={<LibraryExplorerPage />} />
    <Route path="/api-platform/library/:system/:name" element={<LibraryDefinitionPage />} />
    <Route path="/mca/components" element={<McaComponentExplorerPage />} />
    <Route path="/mca/components/:name" element={<McaComponentDefinitionPage />} />
    <Route path="/mca/basetypes" element={<McaBaseTypeExplorerPage />} />
    <Route path="/mca/basetypes/:name" element={<McaBaseTypeDefinitionPage />} />
    <Route path="/health-dashboard" element={
      <RequirePermission permission={devToolsAdministerPermission}>
        <HealthDashboardPage />
      </RequirePermission>
    } />
    <Route path="/tools" element={<ToolsPage />} />
    <Route path="/devtools"
      element={
        <RequirePermission permission={devToolsAdministerPermission}>
          <DevToolsPage />
        </RequirePermission>
      }>
      {customDevToolsPage}
    </Route>
  </FlatRoutes>
);
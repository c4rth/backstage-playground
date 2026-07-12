import { Route } from 'react-router-dom';
import {
  CatalogImportPage,
} from '@backstage/plugin-catalog-import';
import { SearchPage } from '@backstage/plugin-search';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
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
import {
  advancedUserPermission,
} from '@internal/plugin-permissions-common';
// Scaffolder Extensions
import {
  ProjectPickerFieldExtension,
  AlertMessageExtension,
} from '@internal/plugin-scaffolder-extensions';

export const routes = (
  <FlatRoutes>
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
  </FlatRoutes>
);

/*

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
      path="/catalog-unprocessed-entities"
      element={<CatalogUnprocessedEntitiesPage />}
    />
    */
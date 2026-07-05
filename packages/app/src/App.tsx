import {
  apiDocsPlugin,
} from '@backstage/plugin-api-docs';
import { orgPlugin } from '@backstage/plugin-org';
import {
  techdocsPlugin,
} from '@backstage/plugin-techdocs';
import { entityPage } from './modules/catalog/EntityPage';
import { createApp } from '@backstage/frontend-defaults';
import { convertLegacyAppRoot, } from '@backstage/core-compat-api';
// Scaffolder
import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
// Legacy Plugins
import {
  appRegistryNfsPlugin,
  azdoNfsPlugin,
  analyticsNfsPlugin,
  shortcutsNfsPlugin,
} from './legacyPlugins';
// Legacy routes
import { routes } from './routes';
// NFS
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import homePlugin from '@backstage/plugin-home/alpha';
import { homePluginOverrides } from './modules/home';
import devToolsPlugin from '@backstage/plugin-devtools/alpha';
import { appOverrides } from './modules/app';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';

const convertedRootFeatures = convertLegacyAppRoot(routes, { entityPage });

const app = createApp({
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
  features: [
    appOverrides,
    // Nav
    navModule,
    // Legacy
    ...convertedRootFeatures,
    // Nfs plugins
    homePlugin,
    homePluginOverrides,
    catalogPlugin,
    devToolsPlugin,
    catalogImportPlugin,
    // Legacy plugins
    appRegistryNfsPlugin,
    azdoNfsPlugin,
    analyticsNfsPlugin,
    shortcutsNfsPlugin,
  ],
});

export default app.createRoot(
);

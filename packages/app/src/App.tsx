import { entityPage } from './modules/catalog/EntityPage';
import { createApp } from '@backstage/frontend-defaults';
import { convertLegacyAppRoot } from '@backstage/core-compat-api';
// Legacy Plugins
import { shortcutsNfsPlugin } from './legacyPlugins';
// Legacy routes
import { routes } from './routes';
// NFS
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import catalogUnprocessedEntitiesPlugin from '@backstage/plugin-catalog-unprocessed-entities/alpha';
import devToolsPlugin from '@backstage/plugin-devtools/alpha';
import entityValidationPlugin from '@backstage-community/plugin-entity-validation/alpha';
import homePlugin from '@backstage/plugin-home/alpha';
import { homePluginOverrides } from './modules/home';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import { techDocsMermaidAddonModule } from '@internal/plugin-techdocs-addon-mermaid';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import visualizerPlugin from '@backstage/plugin-app-visualizer';
// Custom plugins
import { appOverrides } from './modules/app';
import { navModule } from './modules/nav';
import apiPlatformPlugin from '@internal/plugin-api-platform/alpha';
import appRegistryPlugin from '@internal/plugin-app-registry/alpha';
import azdoPlugin from '@internal/plugin-azure-devops/alpha';
import analyticsPlugin from '@internal/plugin-analytics/alpha';
import healthDashboardPlugin from '@internal/plugin-health-dashboard/alpha';
import toolkitPlugin from '@internal/plugin-toolkit/alpha';
import { devToolsExtensionPlugin } from './modules/devtools';
import mcaPlugin from '@internal/plugin-mca/alpha';

const convertedRootFeatures = convertLegacyAppRoot(routes, { entityPage });

const app = createApp({
  features: [
    appOverrides,
    // Nav
    navModule,
    // Legacy
    ...convertedRootFeatures,
    // Nfs plugins
    catalogPlugin,
    catalogImportPlugin,
    catalogUnprocessedEntitiesPlugin,
    devToolsPlugin,
    devToolsExtensionPlugin,
    entityValidationPlugin,
    homePlugin,
    homePluginOverrides,
    scaffolderPlugin,
    techdocsPlugin,
    techDocsMermaidAddonModule,
    userSettingsPlugin,
    visualizerPlugin,
    // Custom plugins
    apiPlatformPlugin,
    appRegistryPlugin,
    azdoPlugin,
    analyticsPlugin,
    healthDashboardPlugin,
    mcaPlugin,
    toolkitPlugin,
    // Legacy plugins
    shortcutsNfsPlugin,
  ],
});

export default app.createRoot();

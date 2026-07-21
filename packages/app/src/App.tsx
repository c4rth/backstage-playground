import { createApp } from '@backstage/frontend-defaults';
// Legacy Plugins
import { shortcutsNfsPlugin } from './legacyPlugins';
// NFS
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import catalogUnprocessedEntitiesPlugin from '@backstage/plugin-catalog-unprocessed-entities/alpha';
import devToolsPlugin from '@backstage/plugin-devtools/alpha';
import entityValidationPlugin from '@backstage-community/plugin-entity-validation/alpha';
import homePlugin from '@backstage/plugin-home/alpha';
import { homePluginOverrides } from './modules/home';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import { techDocsMermaidAddonModule } from '@internal/plugin-techdocs-addon-mermaid';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha'; 
import visualizerPlugin from '@backstage/plugin-app-visualizer';
// Custom plugins
import { appOverrides } from './modules/app';
import { navModule } from './modules/nav';
import apiDocsSpectralLinterPlugin from '@internal/plugin-api-docs-spectral-linter/alpha';
import apiPlatformPlugin from '@internal/plugin-api-platform/alpha';
import appRegistryPlugin from '@internal/plugin-app-registry/alpha';
import azdoPlugin from '@internal/plugin-azure-devops/alpha';
import analyticsPlugin from '@internal/plugin-analytics/alpha';
import healthDashboardPlugin from '@internal/plugin-health-dashboard/alpha';
import toolkitPlugin from '@internal/plugin-toolkit/alpha';
import { devToolsExtensionPlugin } from './modules/devtools';
import mcaPlugin from '@internal/plugin-mca/alpha';
import { scaffolderExtensions } from '@internal/plugin-scaffolder-extensions';

const app = createApp({
  features: [
    appOverrides,
    // Nav
    navModule,
    // Custom plugins
    apiDocsSpectralLinterPlugin,
    apiPlatformPlugin,
    appRegistryPlugin,
    azdoPlugin,
    analyticsPlugin,
    healthDashboardPlugin,
    mcaPlugin,
    scaffolderExtensions,
    toolkitPlugin,
    // Nfs plugins
    catalogPlugin,
    catalogGraphPlugin,
    catalogImportPlugin,
    catalogUnprocessedEntitiesPlugin,
    devToolsPlugin,
    devToolsExtensionPlugin,
    entityValidationPlugin,
    homePlugin,
    homePluginOverrides,
    scaffolderPlugin,
    searchPlugin,
    techdocsPlugin,
    techDocsMermaidAddonModule,
    userSettingsPlugin,
    visualizerPlugin,
    // Legacy plugins
    shortcutsNfsPlugin,
  ],
});

export default app.createRoot();

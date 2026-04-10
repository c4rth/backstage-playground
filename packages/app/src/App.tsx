import { catalogImportPlugin } from '@backstage/plugin-catalog-import';
import { routes } from './route';

import { appOverrides } from './modules/app';
import { navModule } from './modules/nav';

import {
  AlertDisplay,
  OAuthRequestDialog,
} from '@backstage/core-components';
import { createApp } from '@backstage/frontend-defaults';
import {
  convertLegacyAppRoot,
  convertLegacyAppOptions,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import { AppRouter } from '@backstage/core-app-api';
// Home
import { VisitListener } from '@backstage/plugin-home';
// Plugins
import * as plugins from './legacyPlugins';
// Auto-logout
import { AutoLogout } from '@backstage/core-components';


import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import homePlugin from '@backstage/plugin-home/alpha';
import { homePluginOverrides } from './modules/home';
import orgPlugin from '@backstage/plugin-org/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import { userSettingsPluginOverrides } from './modules/userSettings';
import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';
import { apiDocsPluginOverrides } from './modules/api-docs';
import samplePlugin from '@internal/backstage-plugin-sample';

const legacyAppOptions = convertLegacyAppOptions({
  plugins: Object.values(plugins),
  featureFlags: [
    {
      pluginId: 'api-platform',
      name: 'enable-api-platform-libraries',
      description: 'Enable API Platform libraries',
    },
  ],
});

/*
const legacyFeatures = convertLegacyAppRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AutoLogout />
    <AppRouter>
      <VisitListener />
      <Root>{routes}</Root>
    </AppRouter>
  </>,
); */

const app = createApp({
  features: [
    // App-level overrides (core APIs, icons, sign-in page, feature flags):
    appOverrides,
    // Nav sidebar layout:
    navModule,
    
    samplePlugin,

    // Upstream NFS plugins:
    catalogPlugin,
    catalogGraphPlugin,
    homePlugin,
    homePluginOverrides,
    orgPlugin,
    scaffolderPlugin,
    searchPlugin,
    techdocsPlugin,
    userSettingsPlugin,
    userSettingsPluginOverrides,
    apiDocsPlugin,
    apiDocsPluginOverrides,
    //
    legacyAppOptions,
    // ...legacyFeatures,
  ],
});

export default app.createRoot();

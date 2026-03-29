import { apiDocsPlugin, } from '@backstage/plugin-api-docs';
import {
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { orgPlugin } from '@backstage/plugin-org';
import {techdocsPlugin, } from '@backstage/plugin-techdocs';
import { apis } from './apis';
import { routes } from './route';
import { Root } from './components/Root';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInPage,
} from '@backstage/core-components';
import { createApp } from '@backstage/frontend-defaults';
import { 
  convertLegacyAppRoot,
  convertLegacyAppOptions,
  convertLegacyRouteRef,
  convertLegacyRouteRefs, } from '@backstage/core-compat-api';
import {
  SignInPageBlueprint,
  ThemeBlueprint,
} from '@backstage/plugin-app-react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { AppRouter } from '@backstage/core-app-api';
// Scaffolder
import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
// Theme
import { carthThemes } from './themes/carthTheme';
// Home
import { VisitListener } from '@backstage/plugin-home';
// Identity Providers
import { providers } from './identityProviders';
// Plugins
import * as plugins from './plugins';
// Auto-logout
import { AutoLogout } from '@backstage/core-components';

const optionsModule = convertLegacyAppOptions({
  plugins: Object.values(plugins),
  featureFlags: [
    {
      pluginId: 'api-platform',
      name: 'enable-api-platform-libraries',
      description: 'Enable API Platform libraries',
    },
  ],
});

const signInPageExtension = SignInPageBlueprint.make({
  params: {
    loader: async () => props => (
      <SignInPage
        {...props}
        providers={providers}
        title="Select a sign-in method"
        align="center" />
    ),
  },
});

const carthLightThemeExtension = ThemeBlueprint.make({
  name: 'light',
  params: {
    theme: carthThemes[0],
  },
});

const carthDarkThemeExtension = ThemeBlueprint.make({
  name: 'dark',
  params: {
    theme: carthThemes[1],
  },
});

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
);

const app = createApp({
  bindRoutes({ bind }) {
    bind(convertLegacyRouteRefs(catalogPlugin.externalRoutes), {
      createComponent: convertLegacyRouteRef(scaffolderPlugin.routes.root),
      viewTechDoc: convertLegacyRouteRef(techdocsPlugin.routes.docRoot),
      createFromTemplate: convertLegacyRouteRef(
        scaffolderPlugin.routes.selectedTemplate,
      ),
    });
    bind(convertLegacyRouteRefs(apiDocsPlugin.externalRoutes), {
      registerApi: convertLegacyRouteRef(catalogImportPlugin.routes.importPage),
    });
    bind(convertLegacyRouteRefs(scaffolderPlugin.externalRoutes), {
      registerComponent: false,
      viewTechDoc: convertLegacyRouteRef(techdocsPlugin.routes.docRoot),
    });
    bind(convertLegacyRouteRefs(orgPlugin.externalRoutes), {
      catalogIndex: convertLegacyRouteRef(catalogPlugin.routes.catalogIndex),
    });
  },
  features: [
    optionsModule,
    ...legacyFeatures,
    createFrontendModule({
      pluginId: 'app',
      extensions: [
        ...apis,
        signInPageExtension,
        carthLightThemeExtension,
        carthDarkThemeExtension,
      ],
    }),
  ],
});

export default app.createRoot();

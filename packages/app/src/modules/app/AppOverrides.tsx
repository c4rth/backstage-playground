import {
  SignInPageBlueprint,
  ThemeBlueprint,
} from '@backstage/plugin-app-react';
import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
  scmAuthApiRef,
} from '@backstage/integration-react';
import {
  createFrontendModule,
  analyticsApiRef,
  ApiBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  configApiRef,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
  microsoftAuthApiRef,
} from '@backstage/core-plugin-api';
import { SignInPage } from '@backstage/core-components';
import { DarkThemeProvider, LightThemeProvider } from './customThemes';
import { CustomAnalyticsApi } from '@internal/plugin-analytics';
import { IdentityProviders } from '@backstage/core-components';
import { RiSunFill, RiMoonLine } from '@remixicon/react';

const providers: IdentityProviders = [
  {
    id: 'microsoft-auth-provider',
    title: 'Authenticated',
    message: 'Sign in using Microsoft Entra ID',
    apiRef: microsoftAuthApiRef,
  },
  'guest',
];

export const appOverrides = createFrontendModule({
  pluginId: 'app',
  extensions: [
    ApiBlueprint.make({
      name: 'scm-integrations',
      params: defineParams =>
        defineParams({
          api: scmIntegrationsApiRef,
          deps: {
            configApi: configApiRef,
          },
          factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
        }),
    }),
    ApiBlueprint.make({
      name: 'scm-auth',
      params: defineParams =>
        defineParams({
          api: scmAuthApiRef,
          deps: {
            microsoftAuthApi: microsoftAuthApiRef,
          },
          factory: ({ microsoftAuthApi }) => ScmAuth.forAzure(microsoftAuthApi),
        }),
    }),
    ApiBlueprint.make({
      name: 'analytics',
      params: defineParams =>
        defineParams({
          api: analyticsApiRef,
          deps: {
            discoveryApi: discoveryApiRef,
            fetchApi: fetchApiRef,
            identityApi: identityApiRef,
          },
          factory: ({ discoveryApi, fetchApi, identityApi }) =>
            CustomAnalyticsApi.create({ discoveryApi, fetchApi, identityApi }),
        }),
    }),
    // Themes
    ThemeBlueprint.make({
      name: 'light',
      params: {
        theme: {
          id: 'light',
          title: 'Light Theme',
          variant: 'light',
          icon: <RiSunFill />,
          Provider: LightThemeProvider,
        },
      },
    }),
    ThemeBlueprint.make({
      name: 'dark',
      params: {
        theme: {
          id: 'dark',
          title: 'Dark Theme',
          variant: 'dark',
          icon: <RiMoonLine />,
          Provider: DarkThemeProvider,
        },
      },
    }),
    SignInPageBlueprint.make({
      params: {
        loader: async () => props => (
          <SignInPage
            {...props}
            providers={providers}
            title="Select a sign-in method"
            align="center"
          />
        ),
      },
    }),
  ],
});

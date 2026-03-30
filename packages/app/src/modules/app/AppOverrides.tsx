import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
  scmAuthApiRef,
} from '@backstage/integration-react';
import {
  configApiRef,
  microsoftAuthApiRef,
  identityApiRef,
  errorApiRef,
} from '@backstage/core-plugin-api';
import { visitsApiRef, VisitsWebStorageApi } from '@backstage/plugin-home';
import { ApiBlueprint, createFrontendModule } from '@backstage/frontend-plugin-api';
import { carthThemes } from '../../themes/carthTheme';
import { SignInPageBlueprint, ThemeBlueprint } from '@backstage/plugin-app-react';
import { SignInPage } from '@backstage/core-components';
import { providers } from './identityProviders';

const visitsApiExtension = ApiBlueprint.make({
  name: 'visits',
  params: define =>
    define({
      api: visitsApiRef,
      deps: {
        identityApi: identityApiRef,
        errorApi: errorApiRef,
      },
      factory: ({ identityApi, errorApi }) =>
        VisitsWebStorageApi.create({ identityApi, errorApi }),
    }),
});

const scmIntegrationsApiExtension = ApiBlueprint.make({
  name: 'scm-integrations',
  params: define =>
    define({
      api: scmIntegrationsApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
    }),
});

const scmAuthApiExtension = ApiBlueprint.make({
  name: 'scm-auth',
  params: define =>
    define({
      api: scmAuthApiRef,
      deps: { microsoftAuthApi: microsoftAuthApiRef, },
      factory: ({ microsoftAuthApi }) => ScmAuth.forAzure(microsoftAuthApi),
    }),
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

export const appOverrides = createFrontendModule({
    pluginId: 'app',
    extensions: [
        signInPageExtension,
        carthLightThemeExtension,
        carthDarkThemeExtension,
        scmIntegrationsApiExtension,
        scmAuthApiExtension,
        visitsApiExtension,
    ]
});

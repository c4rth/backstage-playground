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
import { ApiBlueprint } from '@backstage/frontend-plugin-api';


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

export const apis = [
  scmAuthApiExtension,
  scmIntegrationsApiExtension,
];

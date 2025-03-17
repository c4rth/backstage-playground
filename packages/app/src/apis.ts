import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
  scmAuthApiRef,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  microsoftAuthApiRef,
} from '@backstage/core-plugin-api';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { 
      configApi: configApiRef 
    },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  // ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: scmAuthApiRef,
    deps: {
      microsoftAuthApi: microsoftAuthApiRef,
    },
    factory: ({ microsoftAuthApi }) => ScmAuth.forAzure(microsoftAuthApi),
  }),
];

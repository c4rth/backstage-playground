import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
  scmAuthApiRef,
} from '@backstage/integration-react';
import {
  analyticsApiRef,
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  microsoftAuthApiRef,
} from '@backstage/core-plugin-api';
import {
  CustomAnalyticsApi,
} from '@internal/plugin-analytics';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: {
      configApi: configApiRef
    },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  createApiFactory({
    api: scmAuthApiRef,
    deps: {
      microsoftAuthApi: microsoftAuthApiRef,
    },
    factory: ({ microsoftAuthApi }) => ScmAuth.forAzure(microsoftAuthApi),
  }),
  createApiFactory({
    api: analyticsApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      fetchApi: fetchApiRef,
    },
    factory: ({ discoveryApi, fetchApi }) =>
      CustomAnalyticsApi.create({ discoveryApi, fetchApi }),
  }),
];
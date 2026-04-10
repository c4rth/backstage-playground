import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
  scmAuthApiRef,
} from '@backstage/integration-react';
import {
  analyticsApiRef,
  AnalyticsEvent,
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  microsoftAuthApiRef,
} from '@backstage/core-plugin-api';
import { AnalyticsBackendClient, analyticsBackendApiRef } from '@internal/plugin-analytics';

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
    api: analyticsBackendApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      fetchApi: fetchApiRef,
    },
    factory: ({ discoveryApi, fetchApi }) =>
      new AnalyticsBackendClient({ discoveryApi, fetchApi }),
  }),
  createApiFactory({
    api: analyticsApiRef,
    deps: {
      analyticsApi: analyticsBackendApiRef,
    },    
    factory: ({ analyticsApi }) => ({
      captureEvent: async (event: AnalyticsEvent) => {
        await analyticsApi.logEvent(event);
      },
    }),
  }),

];
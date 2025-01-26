import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { ApiPlatformClient, apiPlatformApiRef } from './api';
import { rootRouteRef } from './routes';
import { linterApiRef, LinterClient } from './api';

export const apiPlatformPlugin = createPlugin({
  id: 'api-platform',
  apis: [
    createApiFactory({
      api: apiPlatformApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new ApiPlatformClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const ApiPlatformPage = apiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'ApiPlatformPage',
    component: () =>
      import('./components/ApiPlatformExplorerPage').then(m => m.ApiPlatformExplorerPage),
    mountPoint: rootRouteRef,
  }),
);

export const ApiPlatformDefinitionPage = apiPlatformPlugin.provide(
  createComponentExtension({
    name: 'ApiPlatformDefinitionPage',
    component: {
      lazy: () =>
        import('./components/ApiPlatformDefinitionPage').then(m => m.ApiPlatformDefinitionPage),
    },
  }),
);

/**
* The Backstage plugin that holds API docs spectral linter specific components
* @public
*/
export const apiDocsSpectralLinterPlugin = createPlugin({
  id: 'api-docs-spectral-linter',
  apis: [
    createApiFactory({
      api: linterApiRef,
      deps: {
        configApi: configApiRef,
      },
      factory({ configApi }) {
        return new LinterClient({ configApi });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});


/**
 * An extension for browsing API docs spectral linter on an entity page.
 * @public
 */
export const EntityApiDocsSpectralLinterContent =
  apiDocsSpectralLinterPlugin.provide(
    createRoutableExtension({
      name: 'EntityApiDocsSpectralLinterPluginContent',
      component: () =>
        import('./components/EntityApiDocsSpectralLinterContent').then(
          m => m.EntityApiDocsSpectralLinterContent,
        ),
      mountPoint: rootRouteRef,
    }),
  );

  export const EntityApiDocsSpectralLinterCard = apiDocsSpectralLinterPlugin.provide(
    createComponentExtension({
      name: 'EntityApiDocsSpectralLinterCard',
      component: {
        lazy: () =>
          import('./components/EntityApiDocsSpectralLinterContent').then(m => m.EntityApiDocsSpectralLinterContent),
      },
    }),
  );

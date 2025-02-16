import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { ApiPlatformBackendClient, apiPlatformBackendApiRef } from './api';
import { rootRouteRef } from './routes';
import { linterApiRef, LinterClient } from './api';
import { createSearchResultListItemExtension, SearchResultListItemExtensionProps } from '@backstage/plugin-search-react';
import { ApiPlatformSearchResultListItemProps } from './components/ApiPlatformSearchResultListItem';

export const apiPlatformPlugin = createPlugin({
  id: 'api-platform',
  apis: [
    createApiFactory({
      api: apiPlatformBackendApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new ApiPlatformBackendClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const ApiPlatformExplorerPage = apiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'ApiPlatformExplorerPage',
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

//-------------------------------------------------------------------------------------------------

export const ServicePlatformExplorerPage = apiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'ServicePlatformExplorerPage',
    component: () =>
      import('./components/ServicePlatformExplorerPage').then(m => m.ServicePlatformExplorerPage),
    mountPoint: rootRouteRef,
  }),
);

export const ServicePlatformDefinitionPage = apiPlatformPlugin.provide(
  createComponentExtension({
    name: 'ServicePlatformDefinitionPage',
    component: {
      lazy: () =>
        import('./components/ServicePlatformDefinitionPage').then(m => m.ServicePlatformDefinitionPage),
    },
  }),
);

//-------------------------------------------------------------------------------------------------

export const SystemPlatformExplorerPage = apiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'SystemPlatformExplorerPage',
    component: () =>
      import('./components/SystemPlatformExplorerPage').then(m => m.SystemPlatformExplorerPage),
    mountPoint: rootRouteRef,
  }),
);

export const SystemPlatformDefinitionPage = apiPlatformPlugin.provide(
  createComponentExtension({
    name: 'SystemPlatformDefinitionPage',
    component: {
      lazy: () =>
        import('./components/SystemPlatformDefinitionPage').then(m => m.SystemPlatformDefinitionPage),
    },
  }),
);

//-------------------------------------------------------------------------------------------------

export const ApiPlatformSearchResultListItem: (
  props: SearchResultListItemExtensionProps<ApiPlatformSearchResultListItemProps>,
) => JSX.Element | null = apiPlatformPlugin.provide(
  createSearchResultListItemExtension({
    name: 'ApiPlatformSearchResultListItem',
    component: () =>
      import('./components/ApiPlatformSearchResultListItem').then(
        m => m.ApiPlatformSearchResultListItem,
      ),
    predicate: result => 
      result.type === 'software-catalog' && (result.document as any).type.startsWith('api-platform.'),
  }),
);

//-------------------------------------------------------------------------------------------------

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

//-------------------------------------------------------------------------------------------------

export const ToolkitCard = apiPlatformPlugin.provide(
  createComponentExtension({
    name: 'ToolkitCard',
    component: {
      lazy: () =>
        import('./components/ToolkitCard').then(m => m.ToolkitCard),
    },
  }),
);
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef, ApiPlatformBackendClient } from './api';
import { apiPlatformRouteRef } from './routes';
import { createSearchResultListItemExtension, SearchResultListItemExtensionProps } from '@backstage/plugin-search-react';
import { ApiSearchResultListItemProps } from './components/ApiSearchResultListItem';

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
});

export const ApiExplorerPage = apiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'ApiExplorerPage',
    component: () =>
      import('./components/ApiExplorerPage').then(m => m.ApiExplorerPage),
    mountPoint: apiPlatformRouteRef,
  }),
);

export const ApiDefinitionPage = apiPlatformPlugin.provide(
  createComponentExtension({
    name: 'ApiDefinitionPage',
    component: {
      lazy: () =>
        import('./components/ApiDefinitionPage').then(m => m.ApiDefinitionPage),
    },
  }),
);

export const ApiRedirectToNoSystem = apiPlatformPlugin.provide(
  createComponentExtension({
    name: 'ApiRedirectToNoSystem',
    component: {
      lazy: () =>
        import('./components/ApiDefinitionPage').then(m => m.ApiRedirectToNoSystem),
    },
  }),
);

//-------------------------------------------------------------------------------------------------

export const ServiceExplorerPage = apiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'ServiceExplorerPage',
    component: () =>
      import('./components/ServiceExplorerPage').then(m => m.ServiceExplorerPage),
    mountPoint: apiPlatformRouteRef,
  }),
);

export const ServiceDefinitionPage = apiPlatformPlugin.provide(
  createComponentExtension({
    name: 'ServiceDefinitionPage',
    component: {
      lazy: () =>
        import('./components/ServiceDefinitionPage').then(m => m.ServiceDefinitionPage),
    },
  }),
);

//-------------------------------------------------------------------------------------------------

export const LibraryExplorerPage = apiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'LibraryExplorerPage',
    component: () =>
      import('./components/LibraryExplorerPage').then(m => m.LibraryExplorerPage),
    mountPoint: apiPlatformRouteRef,
  }),
);

//-------------------------------------------------------------------------------------------------

export const SystemExplorerPage = apiPlatformPlugin.provide(
  createRoutableExtension({
    name: 'SystemExplorerPage',
    component: () =>
      import('./components/SystemExplorerPage').then(m => m.SystemExplorerPage),
    mountPoint: apiPlatformRouteRef,
  }),
);

export const SystemDefinitionPage = apiPlatformPlugin.provide(
  createComponentExtension({
    name: 'SystemDefinitionPage',
    component: {
      lazy: () =>
        import('./components/SystemDefinitionPage').then(m => m.SystemDefinitionPage),
    },
  }),
);

//-------------------------------------------------------------------------------------------------

export const ApiSearchResultListItem: (
  props: SearchResultListItemExtensionProps<ApiSearchResultListItemProps>,
) => React.JSX.Element | null = apiPlatformPlugin.provide(
  createSearchResultListItemExtension({
    name: 'ApiSearchResultListItem',
    component: () =>
      import('./components/ApiSearchResultListItem').then(
        m => m.ApiSearchResultListItem,
      ),
    predicate: result => result.type === 'software-catalog' && (result.document as any).type.startsWith('api-platform.')
  }),
);


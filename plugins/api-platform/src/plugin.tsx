import {
  ApiBlueprint,
  PageBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
  createApiRef,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import { ApiPlatformBackendApi, ApiPlatformBackendClient } from './api';
import {
  apiPlatformApiDefinitionRouteRef,
  apiPlatformApiNoSystemRouteRef,
  apiPlatformLibraryDefinitionRouteRef,
  apiPlatformLibraryRouteRef,
  apiPlatformRouteRef,
  apiPlatformServiceDefinitionRouteRef,
  apiPlatformServiceRouteRef,
  apiPlatformSystemDefinitionRouteRef,
  apiPlatformSystemRouteRef,
} from './routes';
import {
  RiShapesLine,
  RiPuzzleFill,
  RiCpuLine,
  RiBookShelfLine,
} from '@remixicon/react';
import { SearchResultListItemBlueprint } from '@backstage/plugin-search-react/alpha';
import {
  createSearchResultListItemExtension,
  SearchResultListItemExtensionProps,
} from '@backstage/plugin-search-react';
import { ApiSearchResultListItemProps } from './components/ApiSearchResultListItem';
import { createPlugin } from '@backstage/core-plugin-api';

const apiExplorerPage = PageBlueprint.make({
  name: 'api-explorer',
  params: {
    noHeader: true,
    icon: <RiPuzzleFill fontSize="inherit" />,
    title: 'APIs',
    path: '/api-platform/api',
    routeRef: apiPlatformRouteRef,
    loader: () =>
      import('./components/ApiExplorerPage').then(m => <m.ApiExplorerPage />),
  },
});

const apiNoSystemPage = PageBlueprint.make({
  name: 'api-no-system',
  params: {
    noHeader: true,
    path: '/api-platform/api/:name',
    routeRef: apiPlatformApiNoSystemRouteRef,
    loader: () =>
      import('./components/ApiDefinitionPage').then(m => (
        <m.ApiRedirectToNoSystem />
      )),
  },
});

const apiDefinitionPage = PageBlueprint.make({
  name: 'api-definition',
  params: {
    noHeader: true,
    path: '/api-platform/api/:system/:name',
    routeRef: apiPlatformApiDefinitionRouteRef,
    loader: () =>
      import('./components/ApiDefinitionPage').then(m => (
        <m.ApiDefinitionPage />
      )),
  },
});

const serviceExplorerPage = PageBlueprint.make({
  name: 'service-explorer',
  params: {
    noHeader: true,
    icon: <RiCpuLine fontSize="inherit" />,
    title: 'Services',
    path: '/api-platform/service',
    routeRef: apiPlatformServiceRouteRef,
    loader: () =>
      import('./components/ServiceExplorerPage').then(m => (
        <m.ServiceExplorerPage />
      )),
  },
});

const serviceDefinitionPage = PageBlueprint.make({
  name: 'service-definition',
  params: {
    noHeader: true,
    path: '/api-platform/service/:system/:name',
    routeRef: apiPlatformServiceDefinitionRouteRef,
    loader: () =>
      import('./components/ServiceDefinitionPage').then(m => (
        <m.ServiceDefinitionPage />
      )),
  },
});

const systemExplorerPage = PageBlueprint.make({
  name: 'system-explorer',
  params: {
    noHeader: true,
    icon: <RiShapesLine fontSize="inherit" />,
    title: 'Systems',
    path: '/api-platform/system',
    routeRef: apiPlatformSystemRouteRef,
    loader: () =>
      import('./components/SystemExplorerPage').then(m => (
        <m.SystemExplorerPage />
      )),
  },
});

const systemDefinitionPage = PageBlueprint.make({
  name: 'system-definition',
  params: {
    noHeader: true,
    path: '/api-platform/system/:name',
    routeRef: apiPlatformSystemDefinitionRouteRef,
    loader: () =>
      import('./components/SystemDefinitionPage').then(m => (
        <m.SystemDefinitionPage />
      )),
  },
});

const libraryExplorerPage = PageBlueprint.make({
  name: 'library-explorer',
  params: {
    noHeader: true,
    icon: <RiBookShelfLine fontSize="inherit" />,
    title: 'Libraries',
    path: '/api-platform/library',
    routeRef: apiPlatformLibraryRouteRef,
    loader: () =>
      import('./components/LibraryExplorerPage').then(m => (
        <m.LibraryExplorerPage />
      )),
  },
});

const libraryDefinitionPage = PageBlueprint.make({
  name: 'library-definition',
  params: {
    noHeader: true,
    path: '/api-platform/library/:system/:name',
    routeRef: apiPlatformLibraryDefinitionRouteRef,
    loader: () =>
      import('./components/LibraryDefinitionPage').then(m => (
        <m.LibraryDefinitionPage />
      )),
  },
});

const apiPlatformApi = ApiBlueprint.make({
  name: 'backend-api',
  params: defineParams =>
    defineParams({
      api: apiPlatformBackendApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new ApiPlatformBackendClient({ discoveryApi, fetchApi }),
    }),
});

export const ApiSearchResultListItemExtension =
  SearchResultListItemBlueprint.make({
    name: 'api-search-result-item',
    params: {
      icon: <RiPuzzleFill fontSize="inherit" />,
      predicate: result =>
        result.type === 'software-catalog' &&
        (result.document as any).type.startsWith('api-platform.'),
      component: () =>
        import('./components/ApiSearchResultListItem').then(
          m => m.ApiSearchResultListItem,
        ),
    },
  });

export const apiPlatformBackendApiRef =
  createApiRef<ApiPlatformBackendApi>().with({
    id: 'plugin.api-platform.service',
  });

export default createFrontendPlugin({
  pluginId: 'api-platform',
  title: 'API Platform',
  routes: {
    apiExplorer: apiPlatformRouteRef,
    apiNoSystem: apiPlatformApiNoSystemRouteRef,
    apiDefinition: apiPlatformApiDefinitionRouteRef,
    serviceExplorer: apiPlatformServiceRouteRef,
    serviceDefinition: apiPlatformServiceDefinitionRouteRef,
    systemExplorer: apiPlatformSystemRouteRef,
    systemDefinition: apiPlatformSystemDefinitionRouteRef,
    libraryExplorer: apiPlatformLibraryRouteRef,
    libraryDefinition: apiPlatformLibraryDefinitionRouteRef,
  },
  extensions: [
    apiExplorerPage,
    apiNoSystemPage,
    apiDefinitionPage,
    serviceExplorerPage,
    serviceDefinitionPage,
    systemExplorerPage,
    systemDefinitionPage,
    libraryExplorerPage,
    libraryDefinitionPage,
    apiPlatformApi,
    ApiSearchResultListItemExtension,
  ],
});

// Legacy support for the SearchResultListItemExtension until the new extension is fully supported in the search plugin

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

export const ApiSearchResultListItem: (
  props: SearchResultListItemExtensionProps<ApiSearchResultListItemProps>,
) => React.JSX.Element | null = apiPlatformPlugin.provide(
  createSearchResultListItemExtension({
    name: 'ApiSearchResultListItem',
    component: () =>
      import('./components/ApiSearchResultListItem').then(
        m => m.ApiSearchResultListItem,
      ),
    predicate: result =>
      result.type === 'software-catalog' &&
      (result.document as any).type.startsWith('api-platform.'),
  }),
);

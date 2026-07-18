import {
  ApiBlueprint,
  PageBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { ApiPlatformBackendClient } from '../api';
import { apiPlatformBackendApiRef } from '../plugin';
import {
  apiPlatformApiDefinitionRouteRef,
  apiPlatformApiNoSystemRouteRef,
  apiPlatformLibraryDefinitionRouteRef,
  apiPlatformLibraryDefinitionServicesRouteRef,
  apiPlatformLibraryRouteRef,
  apiPlatformRouteRef,
  apiPlatformServiceDefinitionRouteRef,
  apiPlatformServiceRouteRef,
  apiPlatformSystemDefinitionRouteRef,
  apiPlatformSystemRouteRef,
} from '../routes';
import {
  RiShapesFill,
  RiPuzzleFill,
  RiCpuLine,
  RiBookShelfLine,
} from '@remixicon/react';

const apiExplorerPage = PageBlueprint.make({
  name: 'api-explorer',
  params: {
    noHeader: true,
    icon: <RiPuzzleFill fontSize="inherit" />,
    title: 'APIs',
    path: '/api-platform/api',
    routeRef: apiPlatformRouteRef,
    loader: () =>
      import('../components/ApiExplorerPage').then(m => <m.ApiExplorerPage />),
  },
});

const apiNoSystemPage = PageBlueprint.make({
  name: 'api-no-system',
  params: {
    noHeader: true,
    path: '/api-platform/api/:name',
    routeRef: apiPlatformApiNoSystemRouteRef,
    loader: () =>
      import('../components/ApiDefinitionPage').then(m => (
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
      import('../components/ApiDefinitionPage').then(m => (
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
      import('../components/ServiceExplorerPage').then(m => (
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
      import('../components/ServiceDefinitionPage').then(m => (
        <m.ServiceDefinitionPage />
      )),
  },
});

const systemExplorerPage = PageBlueprint.make({
  name: 'system-explorer',
  params: {
    noHeader: true,
    icon: <RiShapesFill fontSize="inherit" />,
    title: 'Systems',
    path: '/api-platform/system',
    routeRef: apiPlatformSystemRouteRef,
    loader: () =>
      import('../components/SystemExplorerPage').then(m => (
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
      import('../components/SystemDefinitionPage').then(m => (
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
      import('../components/LibraryExplorerPage').then(m => (
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
      import('../components/LibraryDefinitionPage').then(m => (
        <m.LibraryDefinitionPage />
      )),
  },
});

const libraryDefinitionServicesPage = PageBlueprint.make({
  name: 'library-definition-services',
  params: {
    noHeader: true,
    path: '/api-platform/library/:system/:name/:version',
    routeRef: apiPlatformLibraryDefinitionServicesRouteRef,
    loader: () =>
      import('../components/LibraryDefinitionPage').then(m => (
        <m.LibraryDefinitionServicesPage />
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
    libraryDefinitionServices: apiPlatformLibraryDefinitionServicesRouteRef,
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
    libraryDefinitionServicesPage,
    apiPlatformApi,
  ],
});

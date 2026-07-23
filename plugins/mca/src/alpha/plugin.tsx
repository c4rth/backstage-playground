import {
  ApiBlueprint,
  PageBlueprint,
  configApiRef,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { McaComponentsBackendClient, mcaComponentsBackendApiRef } from '../api';
import {
  baseTypesRouteRef,
  componentsRouteRef,
  componentRouteRef,
  baseTypeRouteRef,
} from '../routes';
import { RiAlbumLine, RiBubbleChartLine } from '@remixicon/react';
import { SearchResultListItemBlueprint } from '@backstage/plugin-search-react/alpha';

const mcaApi = ApiBlueprint.make({
  name: 'mca-components-backend-api',
  params: defineParams =>
    defineParams({
      api: mcaComponentsBackendApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, fetchApi, configApi }) =>
        new McaComponentsBackendClient({ discoveryApi, fetchApi, configApi }),
    }),
});

const mcaComponentsExplorerPage = PageBlueprint.make({
  name: 'mca-components',
  params: {
    noHeader: true,
    icon: <RiBubbleChartLine fontSize="inherit" />,
    title: 'MCA Operations',
    path: '/mca/components',
    routeRef: componentsRouteRef,
    loader: () =>
      import('../components/McaComponentExplorerPage').then(m => (
        <m.McaComponentExplorerPage />
      )),
  },
});

const mcaComponentPage = PageBlueprint.make({
  name: 'mca-component',
  params: {
    noHeader: true,
    path: '/mca/components/:name',
    routeRef: componentRouteRef,
    loader: () =>
      import('../components/McaComponentDefinitionPage').then(m => (
        <m.McaComponentDefinitionPage />
      )),
  },
});

const mcaBaseTypesExplorerPage = PageBlueprint.make({
  name: 'mca-basetypes',
  params: {
    noHeader: true,
    icon: <RiAlbumLine fontSize="inherit" />,
    title: 'MCA BaseTypes',
    path: '/mca/basetypes',
    routeRef: baseTypesRouteRef,
    loader: () =>
      import('../components/McaBaseTypeExplorerPage').then(m => (
        <m.McaBaseTypeExplorerPage />
      )),
  },
});

const mcaBaseTypePage = PageBlueprint.make({
  name: 'mca-basetype',
  params: {
    noHeader: true,
    path: '/mca/basetypes/:name',
    routeRef: baseTypeRouteRef,
    loader: () =>
      import('../components/McaBaseTypeDefinitionPage').then(m => (
        <m.McaBaseTypeDefinitionPage />
      )),
  },
});

const mcaSearchResultListItemExtension = SearchResultListItemBlueprint.make({
  name: 'mca-search-result-item',
  params: {
    icon: <RiBubbleChartLine fontSize="inherit" />,
    predicate: result =>
      result.type === 'mca-components' || result.type === 'mca-basetypes',
    component: () =>
      import('../components/McaComponentSearchResultListItem').then(
        m => m.McaComponentSearchResultListItem,
      ),
  },
});

export default createFrontendPlugin({
  pluginId: 'mca',
  title: 'MCA',
  routes: {
    components: componentsRouteRef,
    baseTypes: baseTypesRouteRef,
  },
  extensions: [
    mcaComponentsExplorerPage,
    mcaBaseTypesExplorerPage,
    mcaComponentPage,
    mcaBaseTypePage,
    mcaApi,
    mcaSearchResultListItemExtension,
  ],
});

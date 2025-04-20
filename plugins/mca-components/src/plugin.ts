import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { mcaComponentsBackendApiRef, McaComponentsBackendClient } from './api/McaComponentsBackendApi';
import { createSearchResultListItemExtension, SearchResultListItemExtensionProps } from '@backstage/plugin-search-react';
import { McaComponentSearchResultListItemProps } from './components/McaComponentSearchResultListItem/McaComponentSearchResultListItem';

export const mcaComponentPlugin = createPlugin({
  id: 'mca-components',
  apis: [
    createApiFactory({
      api: mcaComponentsBackendApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef, configApi: configApiRef, },
      factory: ({ discoveryApi, fetchApi, configApi }) =>
        new McaComponentsBackendClient({ discoveryApi, fetchApi, configApi }),
    }),
  ],
});

export const McaComponentExplorerPage = mcaComponentPlugin.provide(
  createRoutableExtension({
    name: 'McaComponentExplorerPage',
    component: () =>
      import('../../mca-components/src/components/McaComponentExplorerPage').then(m => m.McaComponentExplorerPage),
    mountPoint: rootRouteRef,
  }),
);

export const McaComponentDefinitionPage = mcaComponentPlugin.provide(
  createComponentExtension({
    name: 'McaComponentDefinitionPage',
    component: {
      lazy: () =>
        import('../../mca-components/src/components/McaComponentDefinitionPage').then(m => m.McaComponentDefinitionPage),
    }
  }),
);

export const McaComponentSearchResultListItem: (
  props: SearchResultListItemExtensionProps<McaComponentSearchResultListItemProps>,
) => JSX.Element | null = mcaComponentPlugin.provide(
  createSearchResultListItemExtension({
    name: 'McaComponentSearchResultListItem',
    component: () =>
      import('./components/McaComponentSearchResultListItem').then(
        m => m.McaComponentSearchResultListItem,
      ),
    predicate: result => result.type === 'mca-components',
  }),
);

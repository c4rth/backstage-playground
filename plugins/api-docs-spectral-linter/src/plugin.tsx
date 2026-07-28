import {
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { linterApiRef, LinterClient } from './api';
import { isApiDocsSpectralLinterAvailable } from './lib/helper';

/** @alpha */
export const linterApi = ApiBlueprint.make({
  name: 'linter',
  params: defineParams =>
    defineParams({
      api: linterApiRef,
      deps: {
        configApi: configApiRef,
      },
      factory: ({ configApi }) => new LinterClient({ configApi }),
    }),
});

/** @alpha */
export const entityApiDocsSpectralLinterContent = EntityContentBlueprint.make({
  name: 'entity-content',
  params: {
    path: '/linter',
    title: 'Linter',
    filter: isApiDocsSpectralLinterAvailable,
    loader: () =>
      import('./components/EntityApiDocsSpectralLinterContent').then(m => (
        <m.EntityApiDocsSpectralLinterContent />
      )),
  },
});

/** @alpha */
export const entityApiDocsSpectralLinterCard = EntityCardBlueprint.make({
  name: 'entity-card',
  params: {
    filter: isApiDocsSpectralLinterAvailable,
    loader: () =>
      import('./components/EntityApiDocsSpectralLinterContent').then(m => (
        <m.EntityApiDocsSpectralLinterCard />
      )),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'api-docs-spectral-linter',
  extensions: [
    linterApi,
    entityApiDocsSpectralLinterContent,
    entityApiDocsSpectralLinterCard,
  ],
});

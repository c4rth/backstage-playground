import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { linterApiRef, LinterClient } from './api';

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

// added

export const EntityApiDocsSpectralLinterCard =
  apiDocsSpectralLinterPlugin.provide(
    createComponentExtension({
      name: 'EntityApiDocsSpectralLinterCard',
      component: {
        lazy: () =>
          import('./components/EntityApiDocsSpectralLinterContent').then(
            m => m.EntityApiDocsSpectralLinterContent,
          ),
      },
    }),
  );

import { createFrontendModule } from '@backstage/frontend-plugin-api';

import { PageBlueprint } from '@backstage/frontend-plugin-api';
import homePlugin from '@backstage/plugin-home/alpha';

export const homePageOverrides = PageBlueprint.makeWithOverrides({
  factory(originalFactory) {
    return originalFactory({
      noHeader: true,
      routeRef: homePlugin.routes.root,
      path: '/',
      loader: async () => {
        const { HomePage } = await import('./HomePage');
        return <HomePage />;
      },
    });
  },
});

export const homePluginOverrides = createFrontendModule({
  pluginId: 'home',
  extensions: [homePageOverrides],
});

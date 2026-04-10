import {
  createFrontendPlugin,
  IconComponent,
  NavItemBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';

import { rootRouteRef } from './routes';
import { Ri24HoursFill } from '@remixicon/react';

export const page = PageBlueprint.make({
  params: {
    path: '/sample',
    routeRef: rootRouteRef,
    noHeader: true,
    title: 'Sample',
    icon: <Ri24HoursFill />,
    loader: () =>
      import('./components/ExampleComponent').then(m =>
        <m.ExampleComponent />,
      ),
  },
});

export const samplePlugin = createFrontendPlugin({
  pluginId: 'sample',
  extensions: [
    page,
  ],
  routes: {
    root: rootRouteRef,
  }
});
